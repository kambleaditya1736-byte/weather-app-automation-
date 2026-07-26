pipeline {
    agent any

    environment {
        PORT = "3000"
        NODE_ENV = "production"
    }

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
                sh 'npm install'
            }
        }

        stage('Run Checks') {
            steps {
                echo "========== Running basic checks =========="
                sh '''
                    node --version
                    npm --version
                    npm test
                '''
            }
        }

        stage('Start App Smoke Test') {
            steps {
                echo "========== Starting app smoke test =========="
                sh '''
                    (node app.js > app.log 2>&1 &)
                    for i in $(seq 1 20); do
                        if curl -sf http://127.0.0.1:${PORT}/ >/dev/null 2>&1; then
                            echo "App started successfully"
                            exit 0
                        fi
                        sleep 2
                    done
                    echo "App failed to start"
                    cat app.log
                    exit 1
                '''
            }
        }
    }

    post {
        always {
            echo "========== Pipeline execution completed =========="
        }

        success {
            echo "✓ Pipeline completed successfully"
        }

        failure {
            echo "✗ Pipeline failed"
            sh '''
                if [ -f app.log ]; then
                    echo "---- app log ----"
                    tail -n 20 app.log || true
                fi
            '''
        }
    }
}
