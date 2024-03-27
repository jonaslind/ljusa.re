# ljusa.re

Source code for [ljusa.re](https://ljusa.re), a website displaying sunrise and sunset for cities around the world in a
graph. The site is client-side only; all calculations are done by the browser.

## Building

To build the project, run the following command:

```shell
npm run prepack
```

This will generate all resources in the `dist` folder. You can now copy these resources to your favorite web server, or
serve the site locally on your machine by running the following command:

```shell
npx serve dist
```

## Testing

To execute the project's unit tests, run the following command:

```shell
npm run test
```

## Format Code

To format the code according to the project's style, run the following command:

```shell
npm run format
```

## Deploying

Assumes that the infrastructure is set up as below.

- Set up AWS CLI credentials towards the infrastructure.

- Define the URI of the S3 bucket as an environment variable:

```shell
export LJUSARE_BUCKET_URI="s3://mybucket"
```

- Finally, deploy:

```shell
npm run deploy
```

## Infrastructure

The infrastructure for the website roughly follows Cloudflare's
[Configuring an Amazon Web Services static site to use Cloudflare](https://developers.cloudflare.com/support/third-party-software/others/configuring-an-amazon-web-services-static-site-to-use-cloudflare/)
guide.

## Updating the Places

This project uses location data from GeoNames. See `filterLocations` for how to update the data.
