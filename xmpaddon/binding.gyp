{
  "targets": [
    {
        "target_name": "xmpaddon",
        "sources": [ "xmpaddon.cc" ],
        "include_dirs" : [
            "XMP-Toolkit-SDK-CC201607/public/include"
        ],
        "libraries": [  "../XMP-Toolkit-SDK-CC201607/public/libraries/macintosh/intel_64/Release/libXMPCoreStatic.a",
                        "../XMP-Toolkit-SDK-CC201607/public/libraries/macintosh/intel_64/Release/libXMPFilesStatic.a"],
        "xcode_settings": {
            "OTHER_CPLUSPLUSFLAGS" : [ "-std=c++11", "-stdlib=libc++" ],
            "OTHER_LDFLAGS": [
                "-stdlib=libc++"
            ],
            "MACOSX_DEPLOYMENT_TARGET": "10.12",
            'GCC_ENABLE_CPP_EXCEPTIONS': 'YES'
        },
        'defines': [
            'MAC_ENV=1'
        ],
    }
  ]
}