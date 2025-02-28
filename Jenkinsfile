pipeline {
    agent any
    environment {
        BUILD_NUMBER = "v17"  // 빌드 번호
        IMAGE_NAME = "192.168.2.141:443/k8s-project/moai-front"  // Harbor 이미지 경로
        HARBOR_CREDENTIALS = credentials('harbor') // Jenkins에 등록한 Harbor Credentials ID
        NEXT_PUBLIC_REDIRECT_URI = "https://4254-118-218-200-33.ngrok-free.app/cognitoresponse" 
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-token',  // Jenkins에 등록한 GitHub Credentials ID
                    url: 'https://github.com/acs-final/Frontend.git'  // GitHub 저장소 URL
            }
        }
        
        // "빌드 전" 소나큐브 분석 단계aa
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
                // 2. Quality Gate 결과 확인
        // stage('Quality Gate') {
        //     steps {
        //         script {
        //             // 분석 결과가 처리될 때까지 대기 (기본적으로 최대 1분 기다림 등으로 설정 가능)
        //             timeout(time: 10, unit: 'MINUTES') {
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
                    // Harbor 로그인
                    sh "docker login -u ${HARBOR_CREDENTIALS_USR} -p ${HARBOR_CREDENTIALS_PSW} 192.168.2.141:443"
                }
            }
        }


        stage('Build Docker Image') {
            steps {
                echo "Start to Build the Image"
                echo "NEXT_PUBLIC_REDIRECT_URI=${NEXT_PUBLIC_REDIRECT_URI}"  // 변수 값 출력 (디버깅용)
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
    }
        //     stage('K8S Manifest Update') {
        //     steps {
        //         // GitHub에서 Kubernetes manifest 레포지토리 체크아웃
        //         git credentialsId: 'github_access_token',
        //             url: 'https://github.com/JONBERMAN/k8s-manifest.git',
        //             branch: 'main'
        //         sh 'git config user.email "jenkins@yourdomain.com"'
        //         sh 'git config user.name "Jenkins CI"'
        //         // deployment.yaml 파일의 버전 정보를 현재 빌드 번호로 업데이트
        //         sh """
        //             sed -i 's|image: taehoon981/grey:.*|image: taehoon981/grey:v${BUILD_NUMBER}|g' deployment.yaml
        //         """
        //         // Git에 변경 사항 추가
        //         sh "git add deployment.yaml"
        //         sh "git commit -m '[UPDATE] my-app ${BUILD_NUMBER} image versioning'"

        //         // SSH로 GitHub에 푸시
        //         sshagent(credentials: ['k8s-manifest-credential']) {
        //             sh "git remote set-url origin git@github.com:JONBERMAN/k8s-manifest.git"
        //             sh "git push -u origin main"
        //         }
        //     }
        // }
    }
}
