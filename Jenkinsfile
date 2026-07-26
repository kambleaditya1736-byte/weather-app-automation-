pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = "weather-app:${BUILD_NUMBER}"
        DOCKER_LATEST = "weather-app:latest"
        CONTAINER_NAME = "weather-app-container"
        PORT = "3000"
        REGISTRY = "docker.io"
        // REGISTRY_CREDENTIALS = "docker-hub-credentials" // Add in Jenkins
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo "========== Checking out code =========="
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo "========== Building Docker image =========="
                script {
                    sh 'docker build -t ${DOCKER_IMAGE} .'
                    sh 'docker tag ${DOCKER_IMAGE} ${DOCKER_LATEST}'
                }
            }
        }
        
        stage('Unit Tests') {
            steps {
                echo "========== Running tests =========="
                script {
                    // Create test container
                    sh '''
                        docker run --rm ${DOCKER_IMAGE} npm --version
                        docker run --rm ${DOCKER_IMAGE} node --version
                    '''
                }
            }
        }
        
        stage('Push to Registry') {
            when {
                branch 'main'
            }
            steps {
                echo "========== Pushing image to Docker Hub =========="
                script {
                    // Uncomment and configure credentials in Jenkins
                    // withCredentials([usernamePassword(credentialsId: 'REGISTRY_CREDENTIALS', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    //     sh '''
                    //         echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    //         docker tag ${DOCKER_LATEST} ${DOCKER_USER}/weather-app:latest
                    //         docker push ${DOCKER_USER}/weather-app:latest
                    //         docker logout
                    //     '''
                    // }
                    echo "Skipping push - configure Docker Hub credentials in Jenkins first"
                }
            }
        }
        
        stage('Stop Old Container') {
            steps {
                echo "========== Stopping old container =========="
                script {
                    sh '''
                        if docker ps -a --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
                            docker stop ${CONTAINER_NAME} || true
                            docker rm ${CONTAINER_NAME} || true
                            echo "Old container stopped and removed"
                        else
                            echo "No old container found"
                        fi
                    '''
                }
            }
        }
        
        stage('Deploy Container') {
            steps {
                echo "========== Deploying container =========="
                script {
                    sh '''
                        docker run -d \
                            --name ${CONTAINER_NAME} \
                            -p ${PORT}:3000 \
                            -e NODE_ENV=production \
                            --restart unless-stopped \
                            ${DOCKER_IMAGE}
                        
                        echo "Container deployed successfully"
                        docker ps -a --filter "name=${CONTAINER_NAME}"
                    '''
                }
            }
        }
        
        stage('Health Check') {
            steps {
                echo "========== Running health checks =========="
                script {
                    sh '''
                        echo "Waiting for app to start..."
                        sleep 5
                        
                        for i in {1..10}; do
                            if curl -f http://localhost:${PORT}/ > /dev/null 2>&1; then
                                echo "✓ App is healthy - Status Code: 200"
                                exit 0
                            fi
                            echo "Attempt $i/10 - Waiting for app to be ready..."
                            sleep 2
                        done
                        
                        echo "✗ Health check failed"
                        exit 1
                    '''
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo "========== Verifying deployment =========="
                script {
                    sh '''
                        echo "Container status:"
                        docker ps -a --filter "name=${CONTAINER_NAME}"
                        
                        echo ""
                        echo "Container logs (last 10 lines):"
                        docker logs --tail 10 ${CONTAINER_NAME}
                        
                        echo ""
                        echo "App accessible at: http://localhost:${PORT}"
                    '''
                }
            }
        }
    }
    
    post {
        always {
            echo "========== Pipeline execution completed =========="
        }
        
        success {
            echo "✓ Pipeline completed successfully"
            // Optional: Send notification
            // mail to: 'admin@example.com',
            //      subject: "Jenkins Build Successful - Weather App Build #${BUILD_NUMBER}",
            //      body: "The weather app has been successfully deployed!"
        }
        
        failure {
            echo "✗ Pipeline failed"
            script {
                sh '''
                    echo "Cleaning up failed deployment..."
                    docker stop ${CONTAINER_NAME} || true
                    docker rm ${CONTAINER_NAME} || true
                '''
            }
            // Optional: Send notification
            // mail to: 'admin@example.com',
            //      subject: "Jenkins Build Failed - Weather App Build #${BUILD_NUMBER}",
            //      body: "The weather app deployment failed. Check logs for details."
        }
    }
}
