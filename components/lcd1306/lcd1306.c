#include <stdio.h>
#include <string.h>
#include "driver/i2c_master.h"
#include "driver/gpio.h"
#include "esp_lcd_panel_io.h"
#include "esp_lcd_panel_vendor.h"
#include "esp_lcd_panel_ops.h"
#include "esp_system.h"
#include "esp_log.h"
#include "lvgl.h"
#include "esp_lvgl_port.h"
#include "lcd1306.h"

#define TEST_LCD_H_RES          128
#define TEST_LCD_V_RES          64
#define TEST_I2C_SDA_GPIO       10
#define TEST_I2C_SCL_GPIO       11
#define TEST_I2C_HOST_ID        0
#define TEST_I2C_DEV_ADDR       0x3C
#define TEST_LCD_PIXEL_CLOCK_HZ (400 * 1000)

static esp_lcd_panel_handle_t panel_handle = NULL;
static esp_lcd_panel_io_handle_t io_handle = NULL;
static i2c_master_bus_handle_t bus_handle;
static lv_disp_t *s_disp;
static lv_obj_t *s_label = NULL;

static const char *TAG = "LCD1306";

void lcd1306_init()
{
    i2c_master_bus_config_t i2c_bus_conf = {
        .clk_source = I2C_CLK_SRC_DEFAULT,
        .sda_io_num = TEST_I2C_SDA_GPIO,
        .scl_io_num = TEST_I2C_SCL_GPIO,
        .i2c_port = -1,
    };

    ESP_ERROR_CHECK(i2c_new_master_bus(&i2c_bus_conf, &bus_handle));

    esp_lcd_panel_io_i2c_config_t io_config = {
        .dev_addr = TEST_I2C_DEV_ADDR,
        .scl_speed_hz = TEST_LCD_PIXEL_CLOCK_HZ,
        .control_phase_bytes = 1, // According to SSD1306 datasheet
        .dc_bit_offset = 6,       // According to SSD1306 datasheet
        .lcd_cmd_bits = 8,        // According to SSD1306 datasheet
        .lcd_param_bits = 8,      // According to SSD1306 datasheet
    };

    ESP_ERROR_CHECK(esp_lcd_new_panel_io_i2c(bus_handle, &io_config, &io_handle));

    esp_lcd_panel_dev_config_t panel_config = {
        .bits_per_pixel = 1,
        .reset_gpio_num = -1,
    };
    ESP_ERROR_CHECK(esp_lcd_new_panel_ssd1306(io_handle, &panel_config, &panel_handle));
    ESP_ERROR_CHECK(esp_lcd_panel_reset(panel_handle));
    ESP_ERROR_CHECK(esp_lcd_panel_init(panel_handle));
    // turn on display
    ESP_ERROR_CHECK(esp_lcd_panel_disp_on_off(panel_handle, true));

    ESP_LOGI(TAG, "Initialize LVGL");
    const lvgl_port_cfg_t lvgl_cfg = ESP_LVGL_PORT_INIT_CONFIG();
    lvgl_port_init(&lvgl_cfg);

    const lvgl_port_display_cfg_t disp_cfg = {
        .io_handle = io_handle,
        .panel_handle = panel_handle,
        .buffer_size = TEST_LCD_H_RES * TEST_LCD_V_RES,
        .double_buffer = true,
        .hres = TEST_LCD_H_RES,
        .vres = TEST_LCD_V_RES,
        .monochrome = true,
        .rotation = {
            .swap_xy = false,
            .mirror_x = false,
            .mirror_y = false,
        }
    };
    s_disp = lvgl_port_add_disp(&disp_cfg);

    /* Rotation of the screen */
    lv_disp_set_rotation(s_disp, LV_DISP_ROT_NONE);
}

void lcd1306_run_test()
{
    const uint8_t pattern[][16] = {{
            0x00, 0x7E, 0x42, 0x42, 0x42, 0x42, 0x7E, 0x00,
            0x00, 0x7E, 0x42, 0x42, 0x42, 0x42, 0x7E, 0x00
        },
        {
            0x81, 0x42, 0x24, 0x18, 0x18, 0x24, 0x42, 0x81,
            0x81, 0x42, 0x24, 0x18, 0x18, 0x24, 0x42, 0x81
        }
    };

    for (int i = 0; i < TEST_LCD_H_RES / 16; i++) {
        for (int j = 0; j < TEST_LCD_V_RES / 8; j++) {
            ESP_ERROR_CHECK(esp_lcd_panel_draw_bitmap(panel_handle, i * 16, j * 8, i * 16 + 16, j * 8 + 8, pattern[i & 0x01]));
        }
    }
}

void example_lvgl_demo_ui(lv_disp_t *disp)
{
    lv_obj_t *scr = lv_disp_get_scr_act(disp);
    lv_obj_t *label = lv_label_create(scr);
    lv_label_set_long_mode(label, LV_LABEL_LONG_SCROLL_CIRCULAR); /* Circular scroll */
    lv_label_set_text(label, "Hello Espressif, Hello LVGL.");
    /* Size of the screen (if you use rotation 90 or 270, please set disp->driver->ver_res) */
    lv_obj_set_width(label, disp->driver->hor_res);
    lv_obj_align(label, LV_ALIGN_TOP_MID, 0, 0);
}

void lvgl_set_text(const char *text)
{
    if (s_label == NULL) {
        lv_obj_t *scr = lv_disp_get_scr_act(s_disp);
        s_label = lv_label_create(scr);
        lv_label_set_long_mode(s_label, LV_LABEL_LONG_SCROLL_CIRCULAR); /* Circular scroll */
    }
    lv_label_set_text(s_label, text);
    /* Size of the screen (if you use rotation 90 or 270, please set disp->driver->ver_res) */
    lv_obj_set_width(s_label, s_disp->driver->hor_res);
    lv_obj_align(s_label, LV_ALIGN_TOP_MID, 0, 0);
}

void lcd1306_run_test_02()
{
    ESP_LOGI(TAG, "Display LVGL Scroll Text");

    // Lock the mutex due to the LVGL APIs are not thread-safe
    if (lvgl_port_lock(0)) {
        example_lvgl_demo_ui(s_disp);
        // Release the mutex
        lvgl_port_unlock();
    }
}

void lcd1306_deinit()
{
    ESP_ERROR_CHECK(esp_lcd_panel_del(panel_handle));
    ESP_ERROR_CHECK(esp_lcd_panel_io_del(io_handle));
    ESP_ERROR_CHECK(i2c_del_master_bus(bus_handle));
}