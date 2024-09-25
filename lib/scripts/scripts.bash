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
