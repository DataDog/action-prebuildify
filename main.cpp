#include <node.h>

using namespace v8;

// Code from this example: https://nodejs.org/api/addons.html#context-aware-addons

class AddonData {
  public:
    explicit AddonData(Isolate* isolate):
        call_count(0) {
      // Ensure this per-addon-instance data is deleted at environment cleanup.
      node::AddEnvironmentCleanupHook(isolate, DeleteInstance, this);
    }

    // Per-addon data.
    int call_count;

    static void DeleteInstance(void* data) {
      delete static_cast<AddonData*>(data);
    }
};

static void Method(const v8::FunctionCallbackInfo<v8::Value>& info) {
  AddonData* data =
    reinterpret_cast<AddonData*>(info.Data().As<External>()->Value());
  data->call_count++;
  info.GetReturnValue().Set((double)data->call_count);
}

NODE_MODULE_INIT() {
  Isolate* isolate = context->GetIsolate();
  AddonData* data = new AddonData(isolate);
  Local<External> external = External::New(isolate, data);

  exports->Set(context,
    String::NewFromUtf8(isolate, "Method").ToLocalChecked(),
    FunctionTemplate::New(isolate, Method, external)
      ->GetFunction(context).ToLocalChecked()).FromJust();
}
