#ifndef connect_h
#define connect_h

#include "esp_err.h"

void wifi_init(void);
void wifi_connect_sta(const char *ssid, const char *pass);
void wifi_connect_ap(const char *ssid, const char *pass);
esp_err_t wifi_connect(void);
void wifi_disconnect(void);
void wifi_destroy_netif(void);

#endif