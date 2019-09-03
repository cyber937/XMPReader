#include <node.h>
#include <iostream>

#include "PSDParser.hpp"

void ReadPSD(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    v8::Isolate *isolate = args.GetIsolate();

    PSDParser psdParser;

    v8::String::Utf8Value str(isolate, args[0]);
    string filename(*str);

    string psdJSON = psdParser.getJSONString(filename.c_str());

    v8::Local<v8::String> v8String = v8::String::NewFromUtf8(isolate, psdJSON.c_str(), v8::String::kNormalString);
    args.GetReturnValue().Set(v8String);
}

void Initialize(v8::Local<v8::Object> exports)
{
    NODE_SET_METHOD(exports, "readPSD", ReadPSD);
}

NODE_MODULE(PSDParserAddon, Initialize)