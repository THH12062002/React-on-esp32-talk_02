#ifndef lcd1306_h
#define lcd1306_h

#include "esp_err.h"

void lcd1306_init(void);
void lcd1306_deinit(void);
void lcd1306_run_test(void);
void lcd1306_run_test_02(void);
void lvgl_set_text(const char *text);

#endif