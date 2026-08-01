pipeline {

    agent any

    stages {

        stage('Checkout') {
            steps {
                echo "========== Checking out code =========="
                checkout scm
            }
        }


        stage('Install Dependencies') {
            steps {
                echo "========== Installing Node dependencies =========="
                sh '''
                npm install
                '''
            }
        }


        stage('Test') {
            steps {
                echo "========== Running Tests =========="
                sh '''
                node --version
                npm --version
                npm test
                '''
            }
        }


        stage('Docker Build') {
            steps {
                echo "========== Building Docker Image =========="

                sh '''
                docker build -t weather-app .
                '''
            }
        }


        stage('Deploy Container') {
            steps {
                echo "========== Deploying Container =========="

                sh '''

                docker stop weather-app || true

                docker rm weather-app || true


                docker run -d \
                --name weather-app \
                -p 3000:3000 \
                weather-app


                '''
            }
        }


        stage('Check Deployment') {

            steps {

                echo "========== Checking Application =========="

                sh '''

                sleep 5

                curl -f http://127.0.0.1:3000/

                '''

            }
        }

    }


    post {

        success {
            echo "🚀 CD Deployment Successful"
        }

        failure {
            echo "❌ Deployment Failed"
        }

    }

}
