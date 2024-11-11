#define NAPI_VERSION 4

#include <node_api.h>

napi_value Hello(napi_env env, napi_callback_info info) {
  napi_value result;

  napi_create_string_utf8(env, "hello node", NAPI_AUTO_LENGTH, &result);

  return result;
}

napi_value Init(napi_env env, napi_value exports) {
  napi_value hello;

  napi_create_function(env, NULL, 0, Hello, NULL, &hello);
  napi_set_named_property(env, exports, "hello", hello);

  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init);
