#include <node.h>
#include <iostream>

using namespace std;

#define XMP_INCLUDE_XMPFILES 1
#define TXMP_STRING_TYPE std::string

#include "XMP.incl_cpp"
#include "XMP.hpp"

void SDKVersion(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    v8::Isolate *isolate = args.GetIsolate();

    XMP_VersionInfo version;
    SXMPMeta::GetVersionInfo(&version);

    auto message = v8::String::NewFromUtf8(isolate, version.message);
    args.GetReturnValue().Set(message);
}

SXMPMeta createXMPFromString(string xmp)
{
    SXMPMeta meta;

    const char *xmpBuffer = xmp.c_str();

    // Loop over the rdf string and create the XMP object
    // 10 characters at a time
    int i;
    for (i = 0; i < (long)strlen(xmpBuffer) - 10; i += 10)
    {
        meta.ParseFromBuffer(&xmpBuffer[i], 10, kXMP_ParseMoreBuffers);
    }

    // The last call has no kXMP_ParseMoreBuffers options, signifying
    // this is the last input buffer
    meta.ParseFromBuffer(&xmpBuffer[i], (XMP_StringLen)strlen(xmpBuffer) - i);
    return meta;
}

void XMPRead(const v8::FunctionCallbackInfo<v8::Value> &args)
{

    v8::Isolate *isolate = args.GetIsolate();

    if (!SXMPMeta::Initialize())
    {
        cout << "Could not initialize toolkit!" << endl;
    }
    XMP_OptionBits options = 0;

#if UNIX_ENV
    options |= kXMPFiles_ServerMode;
#endif

    if (!SXMPFiles::Initialize(options))
    {
        cout << "Could not initialize SXMPFiles." << endl;
    }

    XMP_OptionBits opts = kXMPFiles_OpenForRead | kXMPFiles_OpenUseSmartHandler;

    bool ok;
    SXMPFiles myFile;

    if (!args[0]->IsString())
    {
        //cout << "Could not initialize toolkit!" << endl;
        return;
    }

    v8::String::Utf8Value str(isolate, args[0]);
    string filename(*str);

    ok = myFile.OpenFile(filename, kXMP_UnknownFile, opts);

    if (!ok)
    {
        opts = opts = kXMPFiles_OpenForUpdate | kXMPFiles_OpenUsePacketScanning;
        ok = myFile.OpenFile(filename, kXMP_UnknownFile, opts);
    }

    if (ok)
    {
        SXMPMeta meta;
        XMP_PacketInfo info;
        string rawXmp;
        string rdf;

        myFile.GetXMP(&meta, &rawXmp, &info);

        myFile.CloseFile();

        XMP_OptionBits outOpts = kXMP_OmitPacketWrapper;

        meta.SerializeToBuffer(&rdf, outOpts);

        v8::Local<v8::String> v8String = v8::String::NewFromUtf8(isolate, rdf.c_str(), v8::String::kNormalString);
        args.GetReturnValue().Set(v8String);
    }
}

void Initialize(v8::Local<v8::Object> exports)
{
    NODE_SET_METHOD(exports, "sdkVersion", SDKVersion);
    NODE_SET_METHOD(exports, "xmpRead", XMPRead);
}

NODE_MODULE(xmpaddon, Initialize)