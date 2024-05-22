const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const LicensePlugin = require('webpack-license-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const fs = require('fs')

module.exports = {
  entry: './src/App.ts',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          format: {
            comments: false
          },
        },
      }),
    ],
  },
  plugins: [
    new LicensePlugin({
      replenishDefaultLicenseTexts: true,
      includePackages: () => [
        path.resolve(__dirname, "additional-licenses", "solarized"),
        path.resolve(__dirname, "additional-licenses", "geonames"),
        path.resolve(__dirname, "additional-licenses", "open-sans"),
        path.resolve(__dirname, "additional-licenses", "roboto-mono"),
      ],
      additionalFiles: {
        'oss-licenses.json': (packages) => {
          const dependencyUsages = JSON.parse(fs.readFileSync('./dependency-usages.json', 'utf8'));
          const packagesWithUsage = packages.map((pack) => {
            const usage = dependencyUsages.hasOwnProperty(pack.name) ? dependencyUsages[pack.name].usage : dependencyUsages["default"].usage;
            const packageType = dependencyUsages.hasOwnProperty(pack.name) ? dependencyUsages[pack.name].type : dependencyUsages["default"].type;
            var location = (pack.repository.startsWith("git+") ? pack.repository.substring(4) : pack.repository);
            if(!location.startsWith("https://")) {
              location = pack.source;
            }
            if(pack.author !== undefined) {
              return {name: pack.name, location: location, author: pack.author, license: pack.license, licenseText: pack.licenseText, usage: usage, type: packageType};
            } else {
              return {name: pack.name, location: location, license: pack.license, licenseText: pack.licenseText, usage: usage, type: packageType};
            }
          });
          return JSON.stringify(packagesWithUsage, null, 2);
        },
      }
    }),
    new HtmlWebpackPlugin({
      template: "./static/index.html",
      inject: false,
      minify: false
    }),
  ],
};
