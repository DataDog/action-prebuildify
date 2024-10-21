{
  "targets": [{
    "target_name": "test",
    "sources": [
      "main.cpp"
    ],
    "include_dirs": [
      "<!(node -e \"require('nan')\")"
    ],
    "xcode_settings": {
      "MACOSX_DEPLOYMENT_TARGET": "10.10",
      "OTHER_CFLAGS": [
        "-std=c++20",
        "-stdlib=libc++",
        "-Wall"
      ]
    },
    "conditions": [
      ["OS == 'linux'", {
        "cflags": [
          "-Wall"
        ],
        "cflags_cc!": [
          "-std=gnu++20"
        ],
        "cflags_cc": [
          "-std=gnu++2a",
          "-Wno-cast-function-type"
        ]
      }],
      ["OS == 'win'", {
        "cflags": [],
        'defines': [
          'NOMINMAX' # allow std::min/max to work
        ],
      }]
    ]
  }]
}
