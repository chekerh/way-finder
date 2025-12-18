pipeline {
    agent any

    tools {
        nodejs 'NodeJS 20' // Match the Node version in Dockerfile
    }

    environment {
        DOCKER_IMAGE = 'wayfinder-backend'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        MONGODB_URI_TEST = 'mongodb://localhost:27017/wayfindr_test'
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm ci --silent'
            }
        }

        stage('Code Quality Checks') {
            parallel {
                stage('Lint Code') {
                    steps {
                        echo 'Running ESLint...'
                        sh 'npm run lint'
                    }
                }
                stage('Format Check') {
                    steps {
                        echo 'Checking code formatting...'
                        sh 'npm run format -- --check'
                    }
                }
            }
        }

        stage('Unit Tests') {
            steps {
                echo 'Running unit tests...'
                sh 'npm run test -- --watch=false --passWithNoTests'
            }
            post {
                always {
                    junit 'coverage/junit/junit.xml'
                    publishCoverage adapters: [coberturaAdapter('coverage/cobertura-coverage.xml')]
                }
            }
        }

        stage('Build Application') {
            steps {
                echo 'Building NestJS application...'
                sh 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                sh """
                    docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                    docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest
                """
            }
        }

        stage('Integration Tests') {
            steps {
                echo 'Running integration tests...'
                script {
                    try {
                        // Start MongoDB for tests
                        sh 'docker run -d --name mongo-test -p 27017:27017 mongo:7'
                        sh 'sleep 10' // Wait for MongoDB to be ready

                        // Set test environment variables
                        sh '''
                            export NODE_ENV=test
                            export MONGODB_URI=mongodb://localhost:27017/wayfindr_test
                            export JWT_SECRET=test_jwt_secret
                            npm run test:e2e
                        '''
                    } finally {
                        // Clean up test database
                        sh 'docker stop mongo-test || true'
                        sh 'docker rm mongo-test || true'
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                echo 'Running SonarQube analysis...'
                script {
                    def scannerHome = tool 'SonarQubeScanner'
                    withSonarQubeEnv('SonarQube') {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                echo 'Waiting for Quality Gate...'
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Security Scan') {
            steps {
                echo 'Running security scan...'
                sh 'npm audit --audit-level moderate'
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                echo 'Deploying to staging environment...'
                script {
                    // Stop existing container
                    sh 'docker stop wayfinder-staging || true'
                    sh 'docker rm wayfinder-staging || true'

                    // Run new container
                    sh """
                        docker run -d \\
                            --name wayfinder-staging \\
                            -p 3001:3000 \\
                            -e NODE_ENV=staging \\
                            -e MONGODB_URI=\${STAGING_MONGODB_URI} \\
                            -e JWT_SECRET=\${STAGING_JWT_SECRET} \\
                            ${DOCKER_IMAGE}:${DOCKER_TAG}
                    """
                }
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying to production environment...'
                script {
                    // Stop existing container
                    sh 'docker stop wayfinder-prod || true'
                    sh 'docker rm wayfinder-prod || true'

                    // Run new container
                    sh """
                        docker run -d \\
                            --name wayfinder-prod \\
                            -p 3000:3000 \\
                            -e NODE_ENV=production \\
                            -e MONGODB_URI=\${PROD_MONGODB_URI} \\
                            -e JWT_SECRET=\${PROD_JWT_SECRET} \\
                            --restart unless-stopped \\
                            ${DOCKER_IMAGE}:${DOCKER_TAG}
                    """
                }
            }
        }

        stage('Cleanup') {
            steps {
                echo 'Cleaning up old Docker images...'
                sh """
                    docker image prune -f
                    docker container prune -f
                """
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed. Cleaning up workspace...'
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded! ✅'
            script {
                if (env.BRANCH_NAME == 'main') {
                    echo 'Production deployment successful!'
                } else if (env.BRANCH_NAME == 'develop') {
                    echo 'Staging deployment successful!'
                }
            }
        }
        failure {
            echo 'Pipeline failed! ❌'
            script {
                // Send notification on failure
                echo 'TODO: Add notification system (Slack, email, etc.)'
            }
        }
    }
}
