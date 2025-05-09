{
  "targets": [{
    "target_name": "test",
    "sources": [
      "main.cpp"
    ],
    "variables": {
      "node_major": "<!(node --version | sed -e 's/^v\([0-9]*\).*$/\\1/')"
    },
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
        "conditions": [
          ["node_major < 24", {
            "cflags_cc!": [
              "-std=gnu++20"
            ],
            "cflags_cc": [
              "-std=gnu++2a",
              "-Wno-cast-function-type"
            ]
          }],
          ["node_major >= 24", {
            "cflags_cc": [
              "-std=gnu++20",
              "-Wno-cast-function-type"
            ]
          }]
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
