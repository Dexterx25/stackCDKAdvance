kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.13/samples/addons/prometheus.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.13/samples/addons/grafana.yaml

kubectl patch svc grafana -n istio-system -p '{"spec": {"type": "LoadBalancer"}}'
kubectl patch svc prometheus -n istio-system -p '{"spec": {"type": "LoadBalancer"}}'
kubectl patch svc kiali -n istio-system -p '{"spec": {"type": "LoadBalancer"}}'
