pipeline {
    agent any
    environment {
        BUILD_NUMBER = "v33"
        IMAGE_NAME = "192.168.2.141:443/k8s-project/moai-front"
        HARBOR_CREDENTIALS = credentials('harbor')
        NEXT_PUBLIC_REDIRECT_URI = "https://1ccf-118-218-200-33.ngrok-free.app/cognitoresponse"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-token',
                    url: 'https://github.com/acs-final/Frontend.git'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('MySonarQube') {
                    script {
                        def scannerHome = tool 'LocalSonarScanner'
                        sh """
                        ${scannerHome}/bin/sonar-scanner \
                          -Dsonar.projectKey=my_project_key \
                          -Dsonar.projectName=MyProject \
                          -Dsonar.projectVersion=1.0 \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=http://192.168.3.131:9000
                        """
                    }
                }
            }
        }
                // 2. Quality Gate 결과 확인 단계
        // stage('Quality Gate') {
        //     steps {
        //         script {
        //             // 분석 결과가 처리될 때까지 대기 (기본적으로 최대 2분 대기)
        //             timeout(time: 2, unit: 'MINUTES') {
        //                 def qg = waitForQualityGate()
        //                 if (qg.status != 'OK') {
        //                     // 품질 게이트가 통과되지 않으면 빌드 실패 처리
        //                     error "Pipeline aborted due to Quality Gate failure: ${qg.status}"
        //                 }
        //             }
        //         }
        //     }
        // }

        stage('Login to Harbor') {
            steps {
                script {
                    sh "docker login -u ${HARBOR_CREDENTIALS_USR} -p ${HARBOR_CREDENTIALS_PSW} 192.168.2.141:443"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Start to Build the Image"
                sh "docker build --build-arg NEXT_PUBLIC_REDIRECT_URI=${NEXT_PUBLIC_REDIRECT_URI} -t ${IMAGE_NAME}:${BUILD_NUMBER} ."
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

        stage('K8S Manifest Update') {
            steps {
                git credentialsId: 'github-token-wy',
                    url: 'https://github.com/acs-final/manifest.git',
                    branch: 'main'
                
                sh 'git config user.email "wy930914@naver.com"'
                sh 'git config user.name "wy"'
                sh 'git config credential.helper "cache --timeout=3600"'
                
                sh 'git pull --rebase origin main'

                dir('front') {
                    sh """
                        sed -i 's|image: 192.168.2.141:443/k8s-project/moai-front:.*|image: 192.168.2.141:443/k8s-project/moai-front:${BUILD_NUMBER}|g' front-deploy.yaml
                        git add front-deploy.yaml
                        git commit -m '[UPDATE] moai-front ${BUILD_NUMBER} image versioning' || echo 'No changes to commit'
                        git push origin main
                    """
                }
            }
        }
    }
}