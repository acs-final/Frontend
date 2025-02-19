pipeline {
    agent any
    environment {
        BUILD_NUMBER = "v1"  // 빌드 번호
        IMAGE_NAME = "192.168.2.141:443/prototype/moai-front"  // Harbor 이미지 경로
        HARBOR_CREDENTIALS = credentials('harbor') // Jenkins에 등록한 Harbor Credentials ID
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-token',  // Jenkins에 등록한 GitHub Credentials ID
                    url: 'https://github.com/acs-final/Frontend.git'  // GitHub 저장소 URL
            }
        }

        stage('Login to Harbor') {
            steps {
                script {
                    // Harbor 로그인
                    sh "docker login -u ${HARBOR_CREDENTIALS_USR} -p ${HARBOR_CREDENTIALS_PSW} 192.168.2.141:443"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Start to Build the Image"
                sh "docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} ."
                echo "Build Success"
            }
        }

        stage('Push Image to Harbor') {
            steps {
                echo "Pushing Image to Harbor"
                sh "docker push ${IMAGE_NAME}:${BUILD_NUMBER}"
                echo "Push Success"
            }
        }
    }

}

