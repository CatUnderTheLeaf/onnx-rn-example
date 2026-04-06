# onnxruntime-react-native example app with Expo SDK 54

## Get started

1. Install dependencies

   ```bash
   yarn install
   ```

2. Enforce clean build

   ```bash
   yarn prebuild
   ```

3. Build and run the app

   ```bash
   yarn android[ios]
   ```

4. This example uses [Bird Species Classifier](https://huggingface.co/chriamue/bird-species-classifier) from Hugging Face.

   Input data:
   - Float32
   - [1, 3, 224, 224] Tensor

   Output data:
   - 525 logits

5. On the main app screen will be shown first 10 logits of the model inference on a dummy input

## Steps to consider

1. Install the package
   ```bash
   yarn add onnxruntime-react-native
   ```
2. Update `metro.config.js`

   ```js
   config.resolver.assetExts.push("onnx");
   ```

3. Add correct expo plugin to the `plugins` folder and add it to the `app.json`

   ```json
   "plugins": [
      [
        "./plugins/withOrt"
      ],
   ]
   ```

4. For Android release update ProGuard rules in `expo-build-properties` plugin

   ```json
   "extraProguardRules": "-keep class ai.onnxruntime.** { *; }\n-keep class com.microsoft.onnxruntime.extensions.** { *; }\n-keepclasseswithmembernames class * { native <methods>; }\n-keepclassmembers enum * { *; }\n-keep class ai.onnxruntime.OnnxTensor { *; }\n-keep class ai.onnxruntime.OnnxValue { *; }\n-keep class ai.onnxruntime.OrtSession { *; }\n-keep class java.io.Serializable { *; }",

   ```
