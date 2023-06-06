#!/bin/bash
sudo kind create cluster --config suntrackerConfig.yaml && \
sudo kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml && \
sudo kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=90s && \
# sudo kubectl delete -A ValidatingWebhookConfiguration ingress-nginx-admission && \
# sleep 10 && \
sudo kubectl apply -f suntrackerService.yaml
# sudo kind delete cluster
