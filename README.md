# Sun Tracker

Kubernetes version of the Sun Tracker website.

## Usage

> Note: You need [kind](https://kind.sigs.k8s.io/) to run this.

```
chmod +x ./kind_start.sh
./kind_start.sh
```

## Build

```
docker build -t suntracker:v1 .
```

## Credit

- [k8s using kind](https://www.baeldung.com/ops/kubernetes-kind)
- [docker and nginx](https://www.dailysmarty.com/posts/steps-for-deploying-a-static-html-site-with-docker-and-nginx)
- [static site on k8s](https://technicallysound.in/how-to-setup-a-static-site-on-kubernetes/)
- [nginx mime type issue fix](https://github.com/storybookjs/storybook/issues/20157#issuecomment-1464901423)
