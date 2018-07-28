import typescript from "rollup-plugin-typescript2";
import { uglify } from "rollup-plugin-uglify";
import { minify } from "uglify-es";

const plugins = [typescript()];

if (process.env.NODE_ENV !== "development") {
  plugins.push(uglify({}, minify));
}

export default {
  entry: "src/index.ts",
  sourceMap: true,
  moduleName: "KXing",
  plugins
};
