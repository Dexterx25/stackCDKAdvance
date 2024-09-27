kubectl edit pv <name-pv> ## to edit the pv
kubectl edit pv <name-pv> ## to edit the pv

##
you can remove similar lines to restart conection claim pvc services (remove save, and close de file)
  claimRef:
    apiVersion: v1
    kind: PersistentVolumeClaim
    name: jenkins-pvc
    namespace: jenkins
    resourceVersion: "129368"
    uid: 2b781a0d-908e-42ac-82e5-ad83f994ebf5
##
# see the service adresses public elb:
kubectl get svc -n <namescape-name>

kubectl get svc -n ingress

## should shows this: 
NAME                                               TYPE           CLUSTER-IP      EXTERNAL-IP                                                               PORT(S)                      AGE
nginx-ingress-ingress-nginx-controller             LoadBalancer   172.20.245.43   a8ffece52b9c2472b985b504bb6cb0a4-1507807207.us-east-2.elb.amazonaws.com   80:31853/TCP,443:32689/TCP   8m42s
nginx-ingress-ingress-nginx-controller-admission   ClusterIP      172.20.190.67   <none>                                                                    443/TCP                      8m42s

# get pods from namescape

kubectl get pods -n <namescape-name>
kubectl get pods -n <namescape-name>

## show the logs from specific pod:
kubectl logs -n <namespace> <pod-id-name>

## describe a specific pod:
kubectl describe pod -n <namespace-name> <pod-id-name>

# show events from a specific namespace: 
kubectl get events -n <namespace-name>

## apply yaml file to configuration kubernetes: 
kubectl apply -f name.yaml

##delete nameSpace (this goin to remove all kubernets componentes that you have builded): 
kubectl delete namespace <name-space-name>

## see specific section of pod creation from deployment: 
kubectl logs -n <namespace-name> <pod-name> -c <name-section>


##config a context cluster especific

kubectl config current-context


##list context clusters that you saving
kubectl config get-contexts

## change context:
kubectl config use-context <nombre-contexto>

## set context EKS
aws eks update-kubeconfig --name cdkDeploystack15deveksclusterC3FF790C-116103e1d10e438e86c81be05b4e5360  --region us-east-2

##
kubectl get pods
kubectl get services

##delete resources into a namespace
kubectl delete -f <archivo.yaml>


## delete all pods from namespace: 
kubectl delete pod -n jenkins --all

### delete specif pod: 
kubectl delete pod <nombre-pod>
kubectl delete pod <podname-id> -n <namesapce>
## 
kubectl exec -it <nombre-pod> -- <comando>

## show logs container pod:
kubectl logs <nombre-pod> -c <nombre-contenedor>

##change replicasets from into a existing deployment:
kubectl scale deployment <nombre-despliegue> --replicas=<número>

##update deployment:
kubectl set image deployment/<nombre-despliegue> <nombre-contenedor>=<nueva-imagen>

## monitoring resources:
kubectl get pods -w

## init a cluster: 
kubeadm init --pod-network-cidr=<cidr>


## join node worker to existing cluster:
kubeadm join <IP-del-master>:<puerto> --token <token> --discovery-token-ca-cert-hash sha256:<hash>

##update plan:
kubeadm upgrade plan
kubeadm upgrade apply <versión>

## see state of container
kubeadm token list

#whach the state kubelet
systemctl status kubelet

##whats all nodes:
kubectl get nodes

## describe a specific node: 
kubectl describe node <nombre-nodo>

## show all namespaces: 
kubectl get namespaces

## create a namespace: 
kubectl create namespace <nombre-namespace>

## see namespace: 
http://localhost:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/


## limit the access namespaces: 
kubectl create rolebinding <nombre-rolebinding> --clusterrole=<nombre-clusterrole> --serviceaccount=<nombre-namespace>:<nombre-serviceaccount> -n <nombre-namespace>


## see a job process:
 kubectl logs job/fix-permissions -n jenkins


## reset pv claimRef:
kubectl patch pv efs-pv -p '{"spec":{"claimRef":null}}'


## forwardin
kubectl port-forward svc/jenkins -n jenkins 8080:80
kubectl port-forward svc/sonarqube -n sonarqube 9000:9000


## access to kiali dashboard istio:
kubectl port-forward -n istio-system svc/kiali 20001:20001

## remove pod with label: 
kubectl delete pod -l app=kiali -n istio-system


openssl rand -base64 16
y+9G0zxcJMVLyH5WR9EMEA==

juand@DexterDesk MINGW64 ~/Documents/software/devOps/stackCDKAdvance (features/eks_properly)
$ kubectl create secret generic kiali-login \
  --from-literal=username=admin \
  --from-literal=password=<tu-contraseña-segura> \
  -n istio-system


## enter to container pod
kubectl run -it --rm --restart=Never --image=busybox test-pod -- sh

## see control plane: 
kubectl cluster-info
Kubernetes control plane is running at https://33AD6E04EBA6909ECE82689558F4135F.yl4.us-east-2.eks.amazonaws.com
CoreDNS is running at https://33AD6E04EBA6909ECE82689558F4135F.yl4.us-east-2.eks.amazonaws.com/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.


## create secret service account: 
 kubectl create secret generic mi-secret --from-literal=username=jenkins --from-literal=password=123123 -n jenkins

## create token
kubectl create secret generic jenkins-sa-token --type kubernetes.io/service-account-token --namespace jenkins --annotation kubernetes.io/service-account.name=jenkins-sa

## create secret with token:
kubectl create secret generic my-token-secret \
  --from-literal=token=$(openssl rand -base64 32) \
  --namespace jenkins
secret/my-token-secret created

## verify
kubectl get serviceaccount jenkins-sa -n jenkins -o jsonpath='{.secrets[0].name}'
my-token-secret
juand@DexterDesk MINGW64 ~/Documents/software/devOps/stackCDKAdvance/lib/scripts (features/eks_properly)
$ kubectl get secret my-token-secret -n jenkins -o jsonpath='{.data.token}' | base64 --decode
nnTZu7H/ICqnQn6Z+8jiYraq/yO88AYfZ2vJlexP7uo=


## WORKS:: create token for existing user:
kubectl create token jenkins-sa --namespace jenkins

kubectl create token jenkins-sa-1 --namespace jenkins --duration 99999y