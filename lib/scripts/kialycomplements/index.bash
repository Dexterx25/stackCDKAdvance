kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.13/samples/addons/prometheus.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.13/samples/addons/grafana.yaml

kubectl patch svc grafana -n istio-system -p '{"spec": {"type": "LoadBalancer"}}'
kubectl patch svc prometheus -n istio-system -p '{"spec": {"type": "LoadBalancer"}}'
kubectl patch svc kiali -n istio-system -p '{"spec": {"type": "LoadBalancer"}}'


##watch istio versio:

kubectl get pod -n istio-system -l app=istiod -o jsonpath="{.items[0].spec.containers[0].image}"


kubectl get crd gateways.gateway.networking.k8s.io &> /dev/null || \
  { kubectl kustomize "github.com/kubernetes-sigs/gateway-api/config/crd?ref=v1.1.0" | kubectl apply -f -; }
