#include <nan.h>
#include <v8.h>

namespace datadog {
  namespace {
    static void test(const v8::FunctionCallbackInfo<v8::Value>& info) {
      info.GetReturnValue().Set(Nan::New("success").ToLocalChecked());
    }
  }

  NODE_MODULE_INIT() {
    v8::Isolate* isolate = context->GetIsolate();
    void* data = nullptr;
    v8::Local<v8::External> external = v8::External::New(isolate, data);

    exports->Set(
      context,
      Nan::New("test").ToLocalChecked(),
      v8::FunctionTemplate::New(isolate, test, external)->GetFunction(context).ToLocalChecked()
    ).FromJust();
  }
}
