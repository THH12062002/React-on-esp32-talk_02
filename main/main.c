#include <stdio.h>
#include "lcd1306.h"
#include "connect.h"
#include "nvs_library.h"
#include "esp_log.h"
#include "esp_http_server.h"
#include "mdns.h"
#include "routes/_routes.h"
#include "cJSON.h"
#include "esp_spiffs.h"
#include "esp_wifi.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

static const char *SSID = "iPhone_Linhsan";
static const char *PASS = "12345678";
static const char *SSID_AP = "esp32s3";
static const char *PASS_AP = "password";
static const char *s_kvs_key_ssid = "ssid";
static const char *s_kvs_key_password = "password";
static const char *s_kvs_key_wifi_reset = "wifi_reset";
static const char *TAG = "SERVER";
#define MAX_APs 20

static httpd_handle_t server = NULL;

void save_wifi_credentials(const char *ssid, const char *password);

static esp_err_t on_default_url(httpd_req_t *req)
{
  ESP_LOGI(TAG, "Opening page for URL: %s", req->uri);

  esp_vfs_spiffs_conf_t esp_vfs_spiffs_conf = {
      .base_path = "/spiffs",
      .partition_label = NULL,
      .max_files = 5,
      .format_if_mount_failed = true};
  esp_vfs_spiffs_register(&esp_vfs_spiffs_conf);

  char path[600];
  if (strcmp(req->uri, "/") == 0)
    strcpy(path, "/spiffs/index.html");
  else
    sprintf(path, "/spiffs%s", req->uri);
  char *ext = strrchr(path, '.');
  if (ext == NULL || strncmp(ext, ".local", strlen(".local")) == 0)
  {
    httpd_resp_set_status(req, "301 Moved Permanently");
    httpd_resp_set_hdr(req, "Location", "/");
    httpd_resp_send(req, NULL, 0);
    return ESP_OK;
  }
  if (strcmp(ext, ".css") == 0)
    httpd_resp_set_type(req, "text/css");
  if (strcmp(ext, ".js") == 0)
    httpd_resp_set_type(req, "text/javascript");
  if (strcmp(ext, ".png") == 0)
    httpd_resp_set_type(req, "image/png");

  FILE *file = fopen(path, "r");
  if (file == NULL)
  {
    httpd_resp_send_404(req);
    esp_vfs_spiffs_unregister(NULL);
    return ESP_OK;
  }

  char lineRead[256];
  while (fgets(lineRead, sizeof(lineRead), file))
  {
    httpd_resp_sendstr_chunk(req, lineRead);
  }
  httpd_resp_sendstr_chunk(req, NULL);

  esp_vfs_spiffs_unregister(NULL);
  return ESP_OK;
}

static esp_err_t on_get_ap_list(httpd_req_t *req)
{
  wifi_scan_config_t scan_config = {
      .ssid = 0,
      .bssid = 0,
      .channel = 0,
      .show_hidden = true};

  esp_wifi_set_mode(WIFI_MODE_APSTA);
  ESP_ERROR_CHECK(esp_wifi_scan_start(&scan_config, true));

  wifi_ap_record_t wifi_records[MAX_APs];

  uint16_t maxRecods = MAX_APs;
  ESP_ERROR_CHECK(esp_wifi_scan_get_ap_records(&maxRecods, wifi_records));
  cJSON *wifi_scan_json = cJSON_CreateArray();
  for (size_t i = 0; i < maxRecods; i++)
  {
    cJSON *entry = cJSON_CreateObject();
    cJSON_AddStringToObject(entry, "ssid", (char *)wifi_records[i].ssid);
    cJSON_AddNumberToObject(entry, "rssi", wifi_records[i].rssi);
    cJSON_AddItemToArray(wifi_scan_json, entry);
  }
  char *json_string = cJSON_Print(wifi_scan_json);
  httpd_resp_set_type(req, "application/json");
  httpd_resp_send(req, json_string, strlen(json_string));
  cJSON_Delete(wifi_scan_json);
  free(json_string);
  return ESP_OK;
}

/**************** AP TO STA ********************/
typedef struct ap_config_t
{
  char ssid[32];
  char password[64];
} ap_config_t;

static void connect_to_ap(void *params)
{
  wifi_disconnect();
  wifi_destroy_netif();

  ap_config_t *ap_config = (ap_config_t *)params;

  ESP_LOGI(TAG, "Connecting to AP %s %s", ap_config->ssid, ap_config->password);
  wifi_connect_sta(ap_config->ssid, ap_config->password);
  wifi_connect_ap(SSID_AP, PASS_AP);
  if (ESP_OK != wifi_connect()) {
    ESP_LOGE(TAG, "Failed to connect to AP");
  } else {
    ESP_LOGI(TAG, "Connected to AP");
    save_wifi_credentials(ap_config->ssid, ap_config->password);
  }
  
  vTaskDelete(NULL);
}

static esp_err_t on_ap_to_sta(httpd_req_t *req)
{
  char buffer[100];
  static ap_config_t ap_config;

  memset(&buffer, 0, sizeof(buffer));
  httpd_req_recv(req, buffer, req->content_len);
  printf("wifi got here %s\n", buffer);
  cJSON *payload = cJSON_Parse(buffer);
  strcpy(ap_config.ssid, cJSON_GetObjectItem(payload, "ssid")->valuestring);
  strcpy(ap_config.password, cJSON_GetObjectItem(payload, "password")->valuestring);
  cJSON_Delete(payload);

  xTaskCreate(connect_to_ap, "connect_to_ap", 1024 * 5, &ap_config, 1, NULL);
  return ESP_OK;
}

static esp_err_t on_alarms(httpd_req_t *req)
{
  char buffer[100];
  char time[10];
  char label[32];

  memset(&buffer, 0, sizeof(buffer));
  httpd_req_recv(req, buffer, req->content_len);
  printf("Alarm got here %s\n", buffer);
  cJSON *payload = cJSON_Parse(buffer);
  strcpy(time, cJSON_GetObjectItem(payload, "time")->valuestring);
  strcpy(label, cJSON_GetObjectItem(payload, "label")->valuestring);
  char message[100];
  snprintf(message, sizeof(message), "Alarm. %s: %s", time, label);
  // lvgl_set_text(message);
  cJSON_Delete(payload);

  return ESP_OK;
}

/********************Web Socket *******************/

static int client_session_id;

esp_err_t send_ws_message(char *message)
{
  if (!client_session_id)
  {
    ESP_LOGE(TAG, "no client_session_id");
    return -1;
  }
  return send_ws_message_to_clinet(message, client_session_id);
}

esp_err_t send_ws_message_to_clinet(char *message, int clinet_id)
{
  if (!clinet_id)
  {
    ESP_LOGE(TAG, "no client_session_id");
    return -1;
  }
  httpd_ws_frame_t ws_message = {
      .final = true,
      .fragmented = false,
      .len = strlen(message),
      .payload = (uint8_t *)message,
      .type = HTTPD_WS_TYPE_TEXT};
  return httpd_ws_send_frame_async(server, clinet_id, &ws_message);
}

void save_wifi_credentials(const char *ssid, const char *password) {
    esp_err_t err;
    err = nvs_set_value(s_kvs_key_ssid, KVS_TYPE_STR, ssid);
    if (err != ESP_OK) {
      ESP_LOGI(TAG, "Wi-Fi ssid save failed.");
    }

    err = nvs_set_value(s_kvs_key_password, KVS_TYPE_STR, password);
    if (err != ESP_OK) {
      ESP_LOGI(TAG, "Wi-Fi ssid save failed.");
    }

    err = nvs_set_value(s_kvs_key_wifi_reset, KVS_TYPE_STR, "false");
    if (err != ESP_OK) {
      ESP_LOGI(TAG, "Wi-Fi reset flag save failed.");
    }
}

bool load_wifi_credentials(char *ssid, size_t ssid_len, char *password, size_t pass_len) {
    esp_err_t err;
    err = nvs_get_value(s_kvs_key_ssid, KVS_TYPE_STR, ssid);
    if (err != ESP_OK) return false;

    err = nvs_get_value(s_kvs_key_password, KVS_TYPE_STR, password);
    if (err != ESP_OK) return false;

    return true;
}

void clear_wifi_credentials() {
    esp_err_t err;
    err = nvs_remove_key(s_kvs_key_ssid);
    if (err != ESP_OK) {
      ESP_LOGI(TAG, "Wi-Fi ssid clear failed.");
    }

    err = nvs_remove_key(s_kvs_key_password);
    if (err != ESP_OK) {
      ESP_LOGI(TAG, "Wi-Fi password clear failed.");
    }
    ESP_LOGI(TAG, "Wi-Fi credentials cleared.");
}

bool is_reset_button_pressed() {
    esp_err_t err;
    char wifi_reset[5];
    err = nvs_get_value(s_kvs_key_wifi_reset, KVS_TYPE_STR, wifi_reset);
    if (err == ESP_OK) {
      if (strcmp(wifi_reset, "false") == 0) {
        return false;
      }
    }
    return true;
}
/*******************************************/

static void init_server()
{

  httpd_config_t config = HTTPD_DEFAULT_CONFIG();
  config.uri_match_fn = httpd_uri_match_wildcard;

  ESP_ERROR_CHECK(httpd_start(&server, &config));

  httpd_uri_t get_hello_world = {
      .uri = "/api/hello-world",
      .method = HTTP_GET,
      .handler = on_hello_world};
  httpd_register_uri_handler(server, &get_hello_world);

  httpd_uri_t get_ap_list_url = {
      .uri = "/api/get-ap-list",
      .method = HTTP_GET,
      .handler = on_get_ap_list};
  httpd_register_uri_handler(server, &get_ap_list_url);

  httpd_uri_t toggle_led_url = {
      .uri = "/api/toggle-led",
      .method = HTTP_POST,
      .handler = on_toggle_led_url};
  httpd_register_uri_handler(server, &toggle_led_url);

  httpd_uri_t web_magnetometer_url = {
      .uri = "/ws-api/magnetometer",
      .method = HTTP_GET,
      .handler = on_magnetometer,
      .is_websocket = true};
  httpd_register_uri_handler(server, &web_magnetometer_url);

  httpd_uri_t servo_url = {
      .uri = "/ws-api/servo",
      .method = HTTP_GET,
      .handler = on_servo_url,
      .is_websocket = true};
  httpd_register_uri_handler(server, &servo_url);

  // httpd_uri_t btn_push_url = {
  //     .uri = "/ws-api/btn-push",
  //     .method = HTTP_GET,
  //     .handler = on_web_socket_btn_push_url,
  //     .is_websocket = true};
  // httpd_register_uri_handler(server, &btn_push_url);

  httpd_uri_t ap_to_sta_url = {
      .uri = "/api/ap-sta",
      .method = HTTP_POST,
      .handler = on_ap_to_sta};
  httpd_register_uri_handler(server, &ap_to_sta_url);

  httpd_uri_t alarms_url = {
      .uri = "/api/alarms",
      .method = HTTP_POST,
      .handler = on_alarms};
  httpd_register_uri_handler(server, &alarms_url);

  httpd_uri_t default_url = {
      .uri = "/*",
      .method = HTTP_GET,
      .handler = on_default_url};
  httpd_register_uri_handler(server, &default_url);
}

void start_mdns_service()
{
  mdns_init();
  mdns_hostname_set("my-esp32");
  mdns_instance_name_set("LEARN esp32 thing");
}

void app_main(void)
{
  nvs_init();
  vTaskDelay(5000 / portTICK_PERIOD_MS);

  esp_vfs_spiffs_conf_t esp_vfs_spiffs_conf = {
      .base_path = "/spiffs",
      .partition_label = NULL,
      .max_files = 5,
      .format_if_mount_failed = true};
  esp_vfs_spiffs_register(&esp_vfs_spiffs_conf);

  size_t total = 0;
  size_t used = 0;
  esp_spiffs_info(NULL, &total, &used);

  ESP_LOGI("SPIFFS", "total %d, used %d", total, used);
  esp_vfs_spiffs_unregister(NULL);

  init_led();
  init_btn();
  init_servo();
  // lcd1306_init();
  wifi_init();

  // lvgl_set_text("Wifi not connected!");

  // Check wifi need to setup
  bool reset_pressed = is_reset_button_pressed();
  if (reset_pressed) {
      clear_wifi_credentials();
  }

  char ssid[32], password[64];
  if (load_wifi_credentials(ssid, sizeof(ssid), password, sizeof(password))) {
      ESP_LOGI(TAG, "Connecting to SSID: %s", ssid);
      // Connect to Wi-Fi using loaded credentials
  } else {
      ESP_LOGI(TAG, "No saved Wi-Fi credentials.");
      // Start provisioning or fallback mode
  }

  wifi_connect_sta(ssid, password);
  wifi_connect_ap(SSID_AP, PASS_AP);
  // ESP_ERROR_CHECK(wifi_connect());
  wifi_connect();
  start_mdns_service();
  init_server();
}
