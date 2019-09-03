{
  "targets": [
    {
        "target_name": "PSDParserAddon",
        "sources": [ "PSDParserAddon.cc"],
        "include_dirs" : [
            "PSDParser/PSDParser/include"
        ],
        "libraries": ["../PSDParser/Build/Products/Debug/libPSDParserStatic.a"],
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