idf_component_register(SRCS "lcd1306.c"
                    INCLUDE_DIRS "."
                    REQUIRES driver esp_lcd esp_driver_i2c lvgl esp_lvgl_port)
