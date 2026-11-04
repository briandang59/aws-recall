// SAA-C03 service coverage checked against the official exam guide, 2026-11-04.
// Grouping and aliases are for navigation; they do not indicate exam weighting.
export const EXAM_GUIDE_URL = 'https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/saa-03-in-scope-services.html';
export const MAX_TAGS = 8;
export const DEFAULT_TAGS = ['SAA-C03'];
const group = (id,label,icon,tags,items) => ({id,label,icon,tags,items});
export const SERVICE_GROUPS = [
  group('compute','Tính toán · Compute','server',['compute','scalability'],[
    ['EC2','Amazon EC2','elastic compute cloud instances máy ảo'],
    ['EC2 Auto Scaling','Amazon EC2 Auto Scaling','asg scaling group'],
    ['Batch','AWS Batch'],['Elastic Beanstalk','AWS Elastic Beanstalk'],['Outposts','AWS Outposts'],
    ['Serverless Application Repository','AWS Serverless Application Repository','sar'],
    ['VMware Cloud on AWS','VMware Cloud on AWS'],['Wavelength','AWS Wavelength'],
  ]),
  group('serverless','Serverless','bolt',['serverless','scalability'],[
    ['Lambda','AWS Lambda','function hàm'],['Fargate','AWS Fargate'],
  ]),
  group('containers','Container','box',['containers','scalability'],[
    ['ECS','Amazon Elastic Container Service','docker'],['EKS','Amazon Elastic Kubernetes Service','kubernetes k8s'],
    ['ECR','Amazon Elastic Container Registry','docker images'],['ECS Anywhere','Amazon ECS Anywhere'],
    ['EKS Anywhere','Amazon EKS Anywhere'],['EKS Distro','Amazon EKS Distro'],
  ]),
  group('storage','Lưu trữ · Storage','box',['storage','backup'],[
    ['S3','Amazon Simple Storage Service','object bucket'],['S3 Glacier','Amazon S3 Glacier','archive deep archive'],
    ['EBS','Amazon Elastic Block Store','volume snapshot block'],['EFS','Amazon Elastic File System','nfs file'],
    ['FSx','Amazon FSx','lustre windows ontap openzfs smb'],
    ['Storage Gateway','AWS Storage Gateway','hybrid file volume tape'],['Backup','AWS Backup'],
  ]),
  group('database','Cơ sở dữ liệu · Database','database',['database','performance'],[
    ['RDS','Amazon Relational Database Service','mysql postgresql mariadb oracle sql server'],
    ['Aurora','Amazon Aurora','mysql postgresql'],['Aurora Serverless','Amazon Aurora Serverless'],
    ['DynamoDB','Amazon DynamoDB','nosql dax'],['ElastiCache','Amazon ElastiCache','redis valkey memcached caching'],
    ['DocumentDB','Amazon DocumentDB','mongodb'],['Neptune','Amazon Neptune','graph'],['Keyspaces','Amazon Keyspaces','cassandra'],
  ]),
  group('networking','Mạng & phân phối nội dung','network',['networking','high-availability'],[
    ['VPC','Amazon Virtual Private Cloud','subnet route security group nacl'],['Route 53','Amazon Route 53','dns routing'],
    ['ELB','Elastic Load Balancing','alb nlb gwlb application network gateway load balancer cân bằng tải'],
    ['CloudFront','Amazon CloudFront','cdn caching edge'],['Global Accelerator','AWS Global Accelerator'],
    ['Direct Connect','AWS Direct Connect','dx hybrid dedicated'],['Transit Gateway','AWS Transit Gateway','tgw'],
    ['PrivateLink','AWS PrivateLink','private endpoint'],['Site-to-Site VPN','AWS Site-to-Site VPN','ipsec hybrid'],['Client VPN','AWS Client VPN'],
  ]),
  group('security','Bảo mật & danh tính','shield',['security','encryption'],[
    ['IAM','AWS Identity and Access Management','identity user role policy quyền'],['IAM Identity Center','AWS IAM Identity Center','sso'],
    ['KMS','AWS Key Management Service','key encryption mã hóa'],['CloudHSM','AWS CloudHSM'],
    ['Secrets Manager','AWS Secrets Manager','secret rotation password'],['ACM','AWS Certificate Manager','tls ssl certificate'],
    ['Cognito','Amazon Cognito','user pool identity pool'],['Directory Service','AWS Directory Service','active directory ad'],
    ['WAF','AWS Web Application Firewall'],['Shield','AWS Shield','ddos'],['Network Firewall','AWS Network Firewall'],
    ['Firewall Manager','AWS Firewall Manager'],['GuardDuty','Amazon GuardDuty','threat detection'],['Inspector','Amazon Inspector','vulnerability'],
    ['Macie','Amazon Macie','pii sensitive data'],['Detective','Amazon Detective'],['Security Hub','AWS Security Hub'],
    ['RAM','AWS Resource Access Manager','resource sharing'],['Artifact','AWS Artifact','compliance reports'],
  ]),
  group('integration','Tích hợp & hàng đợi','queue',['messaging','decoupling'],[
    ['SQS','Amazon Simple Queue Service','queue dlq fifo'],['SNS','Amazon Simple Notification Service','pub sub fanout notification'],
    ['EventBridge','Amazon EventBridge','events bus scheduler'],['Step Functions','AWS Step Functions','workflow orchestration'],
    ['MQ','Amazon MQ','activemq rabbitmq'],['AppFlow','Amazon AppFlow'],
  ]),
  group('analytics','Phân tích dữ liệu','chart',['analytics','performance'],[
    ['Athena','Amazon Athena','sql s3 query'],['Redshift','Amazon Redshift','data warehouse'],['EMR','Amazon EMR','hadoop spark'],
    ['Glue','AWS Glue','etl catalog crawler'],['Lake Formation','AWS Lake Formation','data lake'],['Kinesis','Amazon Kinesis','streaming data streams firehose'],
    ['MSK','Amazon Managed Streaming for Apache Kafka','kafka'],['OpenSearch','Amazon OpenSearch Service','elasticsearch'],
    ['Quick','Amazon Quick','quicksight business intelligence dashboard'],['Data Exchange','AWS Data Exchange'],['Data Pipeline','AWS Data Pipeline'],
  ]),
  group('management','Quản trị & giám sát','chart',['monitoring','governance'],[
    ['CloudWatch','Amazon CloudWatch','logs metrics alarms'],['CloudTrail','AWS CloudTrail','audit api events'],['Config','AWS Config','compliance rules'],
    ['CloudFormation','AWS CloudFormation','iac infrastructure as code'],['Systems Manager','AWS Systems Manager','ssm parameter store session manager'],
    ['Organizations','AWS Organizations','scp accounts'],['Control Tower','AWS Control Tower','landing zone'],['Auto Scaling','AWS Auto Scaling'],
    ['Compute Optimizer','AWS Compute Optimizer'],['Health Dashboard','AWS Health Dashboard'],['License Manager','AWS License Manager'],
    ['Managed Grafana','Amazon Managed Grafana'],['Managed Prometheus','Amazon Managed Service for Prometheus','prometheus'],
    ['CLI','AWS Command Line Interface'],['Management Console','AWS Management Console'],['Proton','AWS Proton'],
    ['Service Catalog','AWS Service Catalog'],['Well-Architected Tool','AWS Well-Architected Tool'],
  ]),
  group('migration','Di chuyển & truyền dữ liệu','arrow',['migration','hybrid'],[
    ['DMS','AWS Database Migration Service','replication cdc database migration'],['DataSync','AWS DataSync','file transfer'],
    ['Transfer Family','AWS Transfer Family','sftp ftp ftps'],['Snow Family','AWS Snow Family','snowball snowcone snowmobile offline'],
    ['Application Migration Service','AWS Application Migration Service','mgn lift shift'],['Application Discovery Service','AWS Application Discovery Service'],
  ]),
  group('cost','Chi phí & tối ưu','leaf',['cost-optimization','cost'],[
    ['Cost Explorer','AWS Cost Explorer'],['Budgets','AWS Budgets'],['Cost and Usage Report','AWS Cost and Usage Report','cur'],['Savings Plans','AWS Savings Plans'],
  ]),
  group('frontend','API & ứng dụng web','globe',['serverless','integration'],[
    ['API Gateway','Amazon API Gateway','rest http websocket api'],['Amplify','AWS Amplify'],['Device Farm','AWS Device Farm'],
  ]),
  group('machine-learning','AI & Machine Learning','bolt',['machine-learning','analytics'],[
    ['Comprehend','Amazon Comprehend','nlp'],['Lex','Amazon Lex','chatbot'],['Polly','Amazon Polly','text to speech'],
    ['Rekognition','Amazon Rekognition','image video'],['SageMaker AI','Amazon SageMaker AI','sagemaker machine learning'],
    ['Textract','Amazon Textract','ocr document'],['Transcribe','Amazon Transcribe','speech to text'],['Translate','Amazon Translate'],
  ]),
  group('developer','Theo dõi ứng dụng','chart',['monitoring','performance'],[['X-Ray','AWS X-Ray','tracing traces distributed']]),
  group('media','Video & media','globe',['streaming','analytics'],[['Kinesis Video Streams','Amazon Kinesis Video Streams']]),
  group('architecture','Kiến trúc & thành phần bổ sung','layers',['scenario','high-availability'],[
    ['Architecture','Kiến trúc tổng hợp / nhiều dịch vụ','well architected multi service'],
    ['NAT Gateway','NAT Gateway','vpc internet outbound'],['VPC Endpoints','VPC Endpoints','gateway interface endpoint'],
    ['VPC Peering','VPC Peering'],['Security Groups','Security Groups','sg stateful'],['Network ACLs','Network ACLs','nacl stateless'],
    ['Other','Dịch vụ / chủ đề khác'],
  ]),
];

export const SERVICE_CATALOG = SERVICE_GROUPS.flatMap(g => g.items.map(([id,label,aliases = '']) => ({id,label,aliases,group:g.id,groupLabel:g.label,icon:g.icon,tags:g.tags})));
export const SERVICES = SERVICE_CATALOG.map(s => s.id);
const serviceById = new Map(SERVICE_CATALOG.map(s => [s.id,s]));
export const getService = id => serviceById.get(id);
const searchKey = text => String(text).normalize('NFD').replace(/\p{M}/gu,'').replace(/đ/gi,'d').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function searchServices(query = '') {
  const words = searchKey(query).split(' ').filter(Boolean);
  return SERVICE_CATALOG.filter(s => {
    const haystack = searchKey(`${s.id} ${s.label} ${s.aliases} ${s.groupLabel}`);
    return words.every(word => haystack.includes(word));
  });
}
export const TAG_GROUPS = [
  {id:'exam',label:'Kỳ thi',tags:[['SAA-C03','SAA-C03']]},
  {id:'domains',label:'Miền kiến thức SAA-C03',tags:[
    ['secure-architectures','D1 · Kiến trúc bảo mật'],['resilient-architectures','D2 · Khả năng phục hồi'],
    ['high-performance','D3 · Hiệu năng cao'],['cost-optimization','D4 · Tối ưu chi phí'],
  ]},
  {id:'topics',label:'Chủ đề kỹ thuật',tags:[
    ['compute','Compute'],['storage','Storage'],['database','Database'],['networking','Networking'],['security','Security'],
    ['serverless','Serverless'],['containers','Container'],['analytics','Phân tích dữ liệu'],['messaging','Hàng đợi / thông báo'],
    ['integration','Tích hợp'],['migration','Migration'],['hybrid','Hybrid cloud'],['monitoring','Giám sát'],['governance','Quản trị'],
    ['high-availability','Sẵn sàng cao'],['disaster-recovery','Khôi phục thảm họa'],['backup','Sao lưu'],['scalability','Mở rộng'],
    ['performance','Hiệu năng'],['encryption','Mã hóa'],['cost','Chi phí'],['decoupling','Tách rời thành phần'],
    ['caching','Bộ nhớ đệm'],['replication','Nhân bản'],['lifecycle','Vòng đời dữ liệu'],['machine-learning','Machine Learning'],['streaming','Streaming'],
  ]},
  {id:'study',label:'Cách ôn tập',tags:[['scenario','Tình huống'],['comparison','So sánh'],['exam-trap','Dễ nhầm'],['hands-on','Thực hành'],['review','Cần ôn lại']]},
];
const labelByTag = new Map(TAG_GROUPS.flatMap(g => g.tags));
export const tagLabel = tag => labelByTag.get(tag) || tag;
export function parseTagInput(text) {
  const seen = new Set();
  return String(text).split(/[,;\n]/).map(t => t.trim()).filter(t => {
    const key = t.toLowerCase();
    if (!t || seen.has(key)) return false;
    seen.add(key); return true;
  });
}
export function toggleTag(tags,tag) {
  const index = tags.findIndex(t => t.toLowerCase() === tag.toLowerCase());
  if (index >= 0) return tags.filter((_,i) => i !== index);
  if (tags.length >= MAX_TAGS) throw new Error(`Mỗi thẻ tối đa ${MAX_TAGS} nhãn. Bỏ một nhãn trước khi thêm nhé.`);
  return [...tags,tag];
}
export function suggestedTags(service) {
  const base = getService(service)?.tags || [];
  const extra = {S3:['lifecycle','replication','encryption'],VPC:['hybrid','security'],EC2:['high-availability','cost'],RDS:['replication','backup'],Aurora:['replication','high-availability'],ElastiCache:['caching'],CloudFront:['caching'],DynamoDB:['scalability'],Lambda:['decoupling'],SQS:['high-availability']}[service] || [];
  return [...new Set([...base,...extra])];
}
