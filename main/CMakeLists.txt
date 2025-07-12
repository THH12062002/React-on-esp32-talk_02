idf_component_register(
  SRCS 
    "routes/pushBtn.c"
    "routes/toggleLed.c"
    "routes/helloWorld.c"
    "routes/magnetometer.c"
    "routes/servo.c"
    "main.c"
  INCLUDE_DIRS 
    "."
    "routes"
  REQUIRES spiffs mdns json esp_http_server driver wifi memory lcd1306
  )

spiffs_create_partition_image(spiffs ../site/dist FLASH_IN_PROJECT)                    