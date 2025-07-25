#include <stdio.h>
#include <string.h>
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/event_groups.h"
#include "esp_netif.h"
#include "esp_wifi.h"
#include "lcd1306.h"

const static char *TAG = "WIFI";
static esp_netif_t *s_esp_netif_sta;
static esp_netif_t *s_esp_netif_ap;

static EventGroupHandle_t wifi_events;
static const int CONNECTED_GOT_IP = BIT0;
static const int DISCONNECTED = BIT1;
static char s_ip_str[20] = "127.0.0.1";

const char *get_error(uint8_t code)
{
    switch (code)
    {
    case WIFI_REASON_UNSPECIFIED:
        return "WIFI_REASON_UNSPECIFIED";
    case WIFI_REASON_AUTH_EXPIRE:
        return "WIFI_REASON_AUTH_EXPIRE";
    case WIFI_REASON_AUTH_LEAVE:
        return "WIFI_REASON_AUTH_LEAVE";
    case WIFI_REASON_ASSOC_EXPIRE:
        return "WIFI_REASON_ASSOC_EXPIRE";
    case WIFI_REASON_ASSOC_TOOMANY:
        return "WIFI_REASON_ASSOC_TOOMANY";
    case WIFI_REASON_NOT_AUTHED:
        return "WIFI_REASON_NOT_AUTHED";
    case WIFI_REASON_NOT_ASSOCED:
        return "WIFI_REASON_NOT_ASSOCED";
    case WIFI_REASON_ASSOC_LEAVE:
        return "WIFI_REASON_ASSOC_LEAVE";
    case WIFI_REASON_ASSOC_NOT_AUTHED:
        return "WIFI_REASON_ASSOC_NOT_AUTHED";
    case WIFI_REASON_DISASSOC_PWRCAP_BAD:
        return "WIFI_REASON_DISASSOC_PWRCAP_BAD";
    case WIFI_REASON_DISASSOC_SUPCHAN_BAD:
        return "WIFI_REASON_DISASSOC_SUPCHAN_BAD";
    case WIFI_REASON_IE_INVALID:
        return "WIFI_REASON_IE_INVALID";
    case WIFI_REASON_MIC_FAILURE:
        return "WIFI_REASON_MIC_FAILURE";
    case WIFI_REASON_4WAY_HANDSHAKE_TIMEOUT:
        return "WIFI_REASON_4WAY_HANDSHAKE_TIMEOUT";
    case WIFI_REASON_GROUP_KEY_UPDATE_TIMEOUT:
        return "WIFI_REASON_GROUP_KEY_UPDATE_TIMEOUT";
    case WIFI_REASON_IE_IN_4WAY_DIFFERS:
        return "WIFI_REASON_IE_IN_4WAY_DIFFERS";
    case WIFI_REASON_GROUP_CIPHER_INVALID:
        return "WIFI_REASON_GROUP_CIPHER_INVALID";
    case WIFI_REASON_PAIRWISE_CIPHER_INVALID:
        return "WIFI_REASON_PAIRWISE_CIPHER_INVALID";
    case WIFI_REASON_AKMP_INVALID:
        return "WIFI_REASON_AKMP_INVALID";
    case WIFI_REASON_UNSUPP_RSN_IE_VERSION:
        return "WIFI_REASON_UNSUPP_RSN_IE_VERSION";
    case WIFI_REASON_INVALID_RSN_IE_CAP:
        return "WIFI_REASON_INVALID_RSN_IE_CAP";
    case WIFI_REASON_802_1X_AUTH_FAILED:
        return "WIFI_REASON_802_1X_AUTH_FAILED";
    case WIFI_REASON_CIPHER_SUITE_REJECTED:
        return "WIFI_REASON_CIPHER_SUITE_REJECTED";
    case WIFI_REASON_INVALID_PMKID:
        return "WIFI_REASON_INVALID_PMKID";
    case WIFI_REASON_BEACON_TIMEOUT:
        return "WIFI_REASON_BEACON_TIMEOUT";
    case WIFI_REASON_NO_AP_FOUND:
        return "WIFI_REASON_NO_AP_FOUND";
    case WIFI_REASON_AUTH_FAIL:
        return "WIFI_REASON_AUTH_FAIL";
    case WIFI_REASON_ASSOC_FAIL:
        return "WIFI_REASON_ASSOC_FAIL";
    case WIFI_REASON_HANDSHAKE_TIMEOUT:
        return "WIFI_REASON_HANDSHAKE_TIMEOUT";
    case WIFI_REASON_CONNECTION_FAIL:
        return "WIFI_REASON_CONNECTION_FAIL";
    case WIFI_REASON_AP_TSF_RESET:
        return "WIFI_REASON_AP_TSF_RESET";
    case WIFI_REASON_ROAMING:
        return "WIFI_REASON_ROAMING";
    }
    return "WIFI_REASON_UNSPECIFIED";
}

void event_handler(void *event_handler_arg, esp_event_base_t event_base, int32_t event_id, void *event_data)
{
    switch (event_id)
    {
    case WIFI_EVENT_STA_START:
        ESP_LOGI(TAG, "connecting...");
        esp_wifi_connect();
        break;
    case WIFI_EVENT_STA_CONNECTED:
        ESP_LOGI(TAG, "connected");
        break;
    case WIFI_EVENT_STA_DISCONNECTED:
    {
        wifi_event_sta_disconnected_t *wifi_event_sta_disconnected = event_data;
        if (wifi_event_sta_disconnected->reason == WIFI_REASON_ASSOC_LEAVE)
        {
            ESP_LOGI(TAG, "disconnected");
            xEventGroupSetBits(wifi_events, DISCONNECTED);
            break;
        }
        const char *err = get_error(wifi_event_sta_disconnected->reason);
        ESP_LOGE(TAG, "disconnected: %s", err);
        esp_wifi_connect();
        // xEventGroupSetBits(wifi_events, DISCONNECTED);
    }
    break;
    case IP_EVENT_STA_GOT_IP:
        xEventGroupSetBits(wifi_events, CONNECTED_GOT_IP);
        ip_event_got_ip_t* event_got_ip = (ip_event_got_ip_t*) event_data;
        snprintf(s_ip_str, sizeof(s_ip_str), IPSTR, IP2STR(&event_got_ip->ip_info.ip));
        ESP_LOGI(TAG, "Got IP: %s", s_ip_str);
        char message[50];
        snprintf(message, sizeof(message), "Wifi connected. IP: %s", s_ip_str);
        // lvgl_set_text(message);
        break;
    case WIFI_EVENT_AP_START:
        ESP_LOGI(TAG, "AP started");
        break;
    case WIFI_EVENT_AP_STOP:
        ESP_LOGI(TAG, "AP stopped");
        break;
    default:
        break;
    }
}

void wifi_init(void)
{
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    wifi_init_config_t wifi_init_config = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&wifi_init_config));
    ESP_ERROR_CHECK(esp_event_handler_register(WIFI_EVENT, ESP_EVENT_ANY_ID, event_handler, NULL));
    ESP_ERROR_CHECK(esp_event_handler_register(IP_EVENT, IP_EVENT_STA_GOT_IP, event_handler, NULL));
    ESP_ERROR_CHECK(esp_wifi_set_storage(WIFI_STORAGE_RAM));
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_APSTA));
}

void wifi_connect_sta(const char *ssid, const char *pass)
{
    s_esp_netif_sta = esp_netif_create_default_wifi_sta();

    wifi_config_t wifi_config;
    memset(&wifi_config, 0, sizeof(wifi_config_t));
    strncpy((char *)wifi_config.sta.ssid, ssid, sizeof(wifi_config.sta.ssid) - 1);
    strncpy((char *)wifi_config.sta.password, pass, sizeof(wifi_config.sta.password) - 1);

    esp_wifi_set_config(ESP_IF_WIFI_STA, &wifi_config);
}

void wifi_connect_ap(const char *ssid, const char *pass)
{
    s_esp_netif_ap = esp_netif_create_default_wifi_ap();

    wifi_config_t wifi_config;
    memset(&wifi_config, 0, sizeof(wifi_config_t));
    strncpy((char *)wifi_config.ap.ssid, ssid, sizeof(wifi_config.ap.ssid) - 1);
    strncpy((char *)wifi_config.ap.password, pass, sizeof(wifi_config.ap.password) - 1);
    wifi_config.ap.authmode = WIFI_AUTH_WPA_WPA2_PSK;
    wifi_config.ap.max_connection = 4;

    esp_wifi_set_config(ESP_IF_WIFI_AP, &wifi_config);
}

esp_err_t wifi_connect(void)
{
    /* Set sta as the default interface */
    esp_netif_set_default_netif(s_esp_netif_sta);

    /* Enable napt on the AP netif */
    esp_netif_napt_enable(s_esp_netif_ap);

    /* Start WiFi */
    ESP_ERROR_CHECK(esp_wifi_start());

    wifi_events = xEventGroupCreate();
    EventBits_t result = xEventGroupWaitBits(wifi_events, CONNECTED_GOT_IP | DISCONNECTED, pdTRUE, pdFALSE, pdMS_TO_TICKS(10000));
    if (result == CONNECTED_GOT_IP)
    {
        return ESP_OK;
    }
    return ESP_FAIL;
}

void wifi_disconnect(void)
{
    esp_wifi_disconnect();
    esp_wifi_stop();
}

void wifi_destroy_netif(void)
{
    if (s_esp_netif_sta) {
        ESP_ERROR_CHECK(esp_wifi_clear_default_wifi_driver_and_handlers(s_esp_netif_sta));
        esp_netif_destroy(s_esp_netif_sta);
        s_esp_netif_sta = NULL;
    }
    if (s_esp_netif_ap) {
        ESP_ERROR_CHECK(esp_wifi_clear_default_wifi_driver_and_handlers(s_esp_netif_ap));
        esp_netif_destroy(s_esp_netif_ap);
        s_esp_netif_ap = NULL;
    }
}