import { Image } from "expo-image";
import { Platform, StyleSheet } from "react-native";

import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Asset } from "expo-asset";
import { Link } from "expo-router";
import * as ort from "onnxruntime-react-native";
import { useEffect, useState } from "react";

export default function HomeScreen() {
  // get some basic info about the model
  function onnxModelToString(model: ort.InferenceSession): string {
    // Metadate is not yet implemented
    return (
      `ONNX Model:\n` +
      `- Inputs: ${model.inputNames.join(" ")}\n` +
      `- Outputs: ${model.outputNames.join(" ")}`
    );
  }

  // copy model file from assets to a location
  // where onnxruntime can access it, and return the new path
  const copyModelAssetFile = async (assetNumber: number): Promise<string> => {
    const asset = Asset.fromModule(assetNumber);
    await asset.downloadAsync();

    if (!asset.localUri) {
      throw new Error("Failed to resolve asset");
    }

    console.log(`Model file for ${model} is located at:`, asset.localUri);
    return asset.localUri;
  };

  // load the model with onnxruntime-react-native
  async function loadOnnxModel(
    assetNumber: number,
    options: ort.InferenceSession.SessionOptions = {
      executionProviders: ["cpu"],
    },
  ): Promise<ort.InferenceSession> {
    const path = await copyModelAssetFile(assetNumber);
    return ort.InferenceSession.create(path, options);
  }

  const [model, setModel] = useState<ort.InferenceSession | null>(null);

  //////// load model //////
  useEffect(() => {
    const load_model = async () => {
      const model_asset = require("@/assets/models/model.onnx");
      const session = await loadOnnxModel(model_asset);
      setModel(session);
    };
    load_model();
  }, []);

  const [results, setResults] = useState<Array<number>>([]);

  useEffect(() => {
    const runModel = async () => {
      if (model) {
        console.log(onnxModelToString(model));

        ////// run inference on the model and print results //////
        const inputData = new Float32Array(1 * 224 * 224 * 3); // dummy input data
        const feeds: Record<string, ort.Tensor> = {};
        feeds[model.inputNames[0]] = new ort.Tensor(
          "float32",
          inputData,
          [1, 3, 224, 224],
        );

        console.log(
          "Input tensor shape:",
          feeds[model.inputNames[0]].dims,
          "length:",
          feeds[model.inputNames[0]].data.length,
          feeds[model.inputNames[0]].type,
        );

        // Run inference session
        const outputs = await model.run(feeds);
        // Process output

        for (const outputName of model.outputNames) {
          const outputTensor = outputs[outputName];
          if (!outputTensor) {
            console.log(`Output ${outputName} is missing`);
            continue;
          }
          console.log(`Output name: ${outputName}`);
          console.log(`  shape: ${outputTensor.dims}`);
          console.log(
            `  first 10 values: ${Array.from(
              outputTensor.data.slice(0, 10) as ArrayLike<number>,
            )}`,
          );
          setResults(Array.from(outputTensor.data as ArrayLike<number>));
        }
      }
    };
    runModel();
  }, [model]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>

        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        {results.length > 0 && (
          <ThemedText>Results: {results.slice(0, 10).join(", ")}</ThemedText>
        )}
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit{" "}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText>{" "}
          to see changes. Press{" "}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: "cmd + d",
              android: "cmd + m",
              web: "F12",
            })}
          </ThemedText>{" "}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction
              title="Action"
              icon="cube"
              onPress={() => alert("Action pressed")}
            />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert("Share pressed")}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert("Delete pressed")}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">
            npm run reset-project
          </ThemedText>{" "}
          to get a fresh <ThemedText type="defaultSemiBold">app</ThemedText>{" "}
          directory. This will move the current{" "}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{" "}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
