#!/bin/sh

cat > package.json <<EOF
{
  "version": "1.0.0",
  "name": "demo",
  "scripts": {
    "build": "node node_modules/alpinejs-app/scripts/build-app.js",
    "watch": "node node_modules/alpinejs-app/scripts/build-app.js --watch"
  },
  "dependencies": {
    "alpinejs-app": "^1.4.0"
  },
  "devDependencies": {
    "esbuild": "^0.25.0"
  }
}
EOF

cat > index.html <<EOF
<head>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>

<script src="bundle.js"></script>

</head>

<body class="container">
    <div id="app-main"></div>
</body>

<template id="index">
    <h5>This is the index component</h5>

    <button class="btn btn-primary" x-render="'hello/hi?reason=World'">Say Hello</button>
</template>

<template id="hello">
    <h5>This is the <span x-text=\$name></span> component</h5>

    <p>
        First param from render url: <span x-text="params.param1"></span>
    </p>

    <p>
        Named param reason: <span x-text="params.reason"></span>
    </p>

    <div class="m-2 border" x-template.show="template"></div>

    <button class="btn btn-primary" @click="toggle">Toggle</button>

    <button class="btn btn-outline-dark" x-render="'index'">Back</button>
</template>
EOF

cat > example.html <<EOF
<div class="bg-light p-2">
    This is the example template
</div>
EOF

cat > index.js <<EOF
import 'alpinejs-app/dist/app.js'
import './hello'
import './example.html'

app.debug = 1
app.start();
EOF


cat > hello.js <<EOF
app.components.hello = class extends app.AlpineComponent {
    template = ""

    toggle() {
        this.template = !this.template ? "example" : "";
    }
}
EOF

