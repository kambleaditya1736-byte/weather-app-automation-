# Jenkins CI/CD Pipeline for Weather App

## **Pipeline Overview**

The Jenkinsfile automates the build, test, and deployment process:

```
Checkout → Build → Test → Push → Deploy → Health Check → Verify
```

---

## **Pipeline Stages Explained**

### **1. Checkout**
- Clones the repository code into Jenkins workspace
- Runs on every trigger

### **2. Build Docker Image**
- Builds Docker image using the Dockerfile
- Tags with build number and `latest`
- Command: `docker build -t weather-app:${BUILD_NUMBER} .`

### **3. Unit Tests**
- Verifies Node.js and npm are installed in image
- Quick smoke test to ensure image is valid

### **4. Push to Registry** *(Optional - Main branch only)*
- Pushes image to Docker Hub
- Requires credentials configured in Jenkins
- Only runs on `main` branch

### **5. Stop Old Container**
- Stops and removes previous container
- Prevents port conflicts

### **6. Deploy Container**
- Launches new container on port 3000
- Sets environment to production
- Enables auto-restart on failure

### **7. Health Check**
- Waits for app to start (5 seconds)
- Attempts 10 requests to `http://localhost:3000`
- Fails pipeline if app doesn't respond

### **8. Verify Deployment**
- Shows container status, logs, and access URL
- Confirms successful deployment

---

## **Setup Instructions**

### **Step 1: Install Jenkins Plugins**
1. Go to **Manage Jenkins** → **Manage Plugins**
2. Install:
   - `Pipeline` plugin
   - `Docker` plugin
   - `Git` plugin
   - (Already installed usually)

### **Step 2: Configure Docker Access**
1. Go to **Manage Jenkins** → **Configure System**
2. Find **Docker** section
3. Set Docker daemon URL: `unix:///var/run/docker.sock` (Linux) or `npipe:////./pipe/docker_engine` (Windows)
4. Test connection

### **Step 3: Create New Pipeline Job**
1. Click **New Item**
2. Enter name: `weather-app-pipeline`
3. Select **Pipeline**
4. Click **OK**

### **Step 4: Configure Pipeline**
1. Scroll to **Pipeline** section
2. Select **Pipeline script from SCM**
3. Choose **Git**
4. Repository URL: `https://github.com/your-username/weather-app.git` (or your repo)
5. Credentials: Add GitHub credentials if private repo
6. Script Path: `Jenkinsfile`
7. Click **Save**

### **Step 5: (Optional) Docker Hub Push Credentials**
1. Go to **Manage Jenkins** → **Manage Credentials**
2. Click **global** domain
3. Click **Add Credentials**
4. Fill in:
   - **Kind**: Username with password
   - **Username**: your Docker Hub username
   - **Password**: Docker Hub access token
   - **ID**: `docker-hub-credentials`
5. Save
6. Uncomment Docker Hub push section in Jenkinsfile

---

## **Trigger Pipeline**

### **Manual Trigger**
1. Open job `weather-app-pipeline`
2. Click **Build Now**

### **Automatic Trigger (GitHub Webhook)**
1. Go to GitHub repo → **Settings** → **Webhooks**
2. Click **Add webhook**
3. Payload URL: `http://your-jenkins-server/github-webhook/`
4. Content type: `application/json`
5. Events: **Push events**
6. Click **Add webhook**

### **Scheduled Trigger (Cron)**
1. In Jenkins job configuration
2. Go to **Build Triggers** → check **Build periodically**
3. Schedule: `H H * * *` (daily at midnight)

---

## **View Pipeline Results**

1. Open job → Click recent build
2. View:
   - **Console Output**: Full build logs
   - **Stage View**: Visual pipeline stages
   - **Blue Ocean**: Modern UI (install plugin for this)

---

## **Environment Variables in Pipeline**

| Variable | Value | Usage |
|----------|-------|-------|
| `BUILD_NUMBER` | Auto-incremented | Docker image tag |
| `CONTAINER_NAME` | `weather-app-container` | Container identification |
| `PORT` | `3000` | App port mapping |
| `DOCKER_IMAGE` | `weather-app:${BUILD_NUMBER}` | Build image name |
| `DOCKER_LATEST` | `weather-app:latest` | Latest production tag |

---

## **Troubleshooting**

### **Build fails: "Docker daemon not accessible"**
- Start Docker Desktop on Windows/Mac
- Ensure Docker socket/pipe is configured in Jenkins

### **Container fails to start**
- Check logs: `docker logs weather-app-container`
- Verify port 3000 is not already in use

### **Health check timeout**
- App may take longer to start
- Increase sleep time in **Health Check** stage

### **Push to Docker Hub fails**
- Verify credentials are configured in Jenkins
- Uncomment Docker Hub section in Jenkinsfile
- Check Docker Hub username/token

---

## **Next Steps**

1. **Create GitHub repo** with this code
2. **Set up Jenkins server** (local or cloud)
3. **Create pipeline job** following setup instructions
4. **Push to GitHub** to trigger automatic builds
5. **Monitor builds** in Jenkins dashboard

---

## **Advanced: Multi-branch Pipeline**

Create separate pipelines for different branches:

1. Use **Multibranch Pipeline** job type
2. Branches: `main`, `develop`, `feature/*`
3. Different environments for each branch
4. Auto-create jobs for new branches

---

## **Bonus: Deploy to Production**

Add extra stage for production deployment:

```groovy
stage('Deploy to Production') {
    when {
        tag "v*"
    }
    steps {
        echo "Deploying to production server..."
        sh 'docker push your-registry/weather-app:latest'
        sh 'ssh prod-server "docker pull weather-app:latest && docker-compose up -d"'
    }
}
```

---

**Your weather app is now ready for enterprise-grade CI/CD!** 🚀
