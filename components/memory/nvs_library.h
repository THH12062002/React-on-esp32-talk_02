#ifndef NVS_LIBRARY_H
#define NVS_LIBRARY_H

#include "esp_err.h"

typedef enum {
    KVS_TYPE_I8,
	KVS_TYPE_U8,
	KVS_TYPE_U16, 
	KVS_TYPE_I16,
	KVS_TYPE_U32,
	KVS_TYPE_I32,
	KVS_TYPE_U64,
	KVS_TYPE_I64,
	KVS_TYPE_STR,
	KVS_TYPE_BLOB,
	KVS_TYPE_ANY
} kvs_type_t;

void nvs_init(void);
esp_err_t nvs_set_value(const char *key, kvs_type_t kvs_type, const char *str_value);
// Test for string
esp_err_t nvs_get_value(const char *key, kvs_type_t kvs_type, void* str_value);
esp_err_t nvs_remove_key(const char *key);
esp_err_t nvs_remove_all_keys(const char *name);
int nvs_get_all_keys(const char *part, const char *name, kvs_type_t kvs_type);

#endif // NVS_LIBRARY_H
