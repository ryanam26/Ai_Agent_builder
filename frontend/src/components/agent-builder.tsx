'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Loader2, Bot, Zap, Search, Code, TestTube, Rocket, MessageCircle, CheckCircle2, AlertCircle, Plus, X, Lightbulb } from 'lucide-react'

interface BuildStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  icon: React.ComponentType<any>
}

const BUILD_STEPS: BuildStep[] = [
  {
    id: 'parse',
    title: 'Understanding your agent',
    description: 'Analyzing requirements and capabilities',
    status: 'pending',
    icon: Bot
  },
  {
    id: 'research',
    title: 'Researching tools',
    description: 'Finding the best APIs and integrations',
    status: 'pending',
    icon: Search
  },
  {
    id: 'plan',
    title: 'Creating implementation plan',
    description: 'Generating step-by-step build process',
    status: 'pending',
    icon: Code
  },
  {
    id: 'validate',
    title: 'Validating agent design',
    description: 'Ensuring everything works together',
    status: 'pending',
    icon: TestTube
  },
  {
    id: 'deploy',
    title: 'Preparing deployment',
    description: 'Creating production-ready agent',
    status: 'pending',
    icon: Rocket
  }
]

const AGENT_CATEGORIES = [
  {
    name: "Human Resources",
    icon: "👥",
    agents: [
      {
        title: "Recruitment Assistant",
        description: "Screen resumes, schedule interviews, track candidates",
        icon: "🎯",
        fullDescription: "A recruitment assistant agent that can screen resumes based on job requirements, automatically schedule interviews with candidates, track application status through the hiring pipeline, send automated follow-up emails, and integrate with ATS systems like Greenhouse or Workday."
      },
      {
        title: "Employee Onboarding",
        description: "Guide new hires through onboarding process",
        icon: "🚀",
        fullDescription: "An employee onboarding agent that guides new hires through their first weeks, automatically creates accounts and access permissions, sends personalized welcome materials, schedules orientation meetings, tracks completion of required training, and collects necessary paperwork through integrated forms."
      },
      {
        title: "Performance Review Manager",
        description: "Automate review cycles and feedback collection",
        icon: "📈",
        fullDescription: "A performance review management agent that automates quarterly and annual review cycles, sends reminder notifications to managers and employees, collects 360-degree feedback from peers, generates performance reports with analytics, and integrates with HRIS systems like BambooHR or Workday."
      },
      {
        title: "Benefits Assistant",
        description: "Answer benefits questions and process enrollments",
        icon: "🏥",
        fullDescription: "A benefits assistant agent that answers employee questions about health insurance, retirement plans, and other benefits, processes enrollment changes during open enrollment periods, calculates benefit costs, sends deadline reminders, and integrates with benefits platforms like Workday or ADP."
      },
      {
        title: "Leave Management",
        description: "Process time-off requests and track balances",
        icon: "🏖️",
        fullDescription: "A leave management agent that processes vacation and sick leave requests, automatically checks available balances, notifies managers for approval, updates payroll systems, tracks FMLA compliance, handles holiday schedules, and integrates with time tracking systems like Kronos or BambooHR."
      },
      {
        title: "Training Coordinator",
        description: "Schedule training and track certifications",
        icon: "🎓",
        fullDescription: "A training coordinator agent that identifies skill gaps, schedules mandatory training sessions, tracks certification expiration dates, assigns online learning modules, generates training reports for compliance, and integrates with learning management systems like Cornerstone OnDemand or Workday Learning."
      }
    ]
  },
  {
    name: "Marketing",
    icon: "📢",
    agents: [
      {
        title: "Content Creator",
        description: "Generate blog posts, social media content, and marketing copy",
        icon: "✍️",
        fullDescription: "A content creation agent that generates blog posts, social media content, email newsletters, and marketing copy based on brand guidelines and target audience preferences. It can research trending topics, optimize content for SEO, create content calendars, and integrate with CMS platforms like WordPress and social media schedulers like Hootsuite."
      },
      {
        title: "Social Media Manager",
        description: "Schedule posts, engage with followers, analyze metrics",
        icon: "📱",
        fullDescription: "A social media management agent that schedules posts across multiple platforms, responds to comments and messages, monitors brand mentions, analyzes engagement metrics, tracks hashtag performance, and provides recommendations for optimal posting times. Integrates with platforms like Facebook, Twitter, Instagram, LinkedIn, and tools like Buffer or Sprout Social."
      },
      {
        title: "Email Campaign Manager",
        description: "Create and optimize email marketing campaigns",
        icon: "📧",
        fullDescription: "An email campaign management agent that creates personalized email campaigns, segments audiences based on behavior and demographics, performs A/B testing on subject lines and content, tracks open rates and click-through rates, manages unsubscribes, and integrates with email platforms like Mailchimp, SendGrid, or HubSpot."
      },
      {
        title: "Lead Qualifier",
        description: "Score and prioritize incoming leads",
        icon: "🎯",
        fullDescription: "A lead qualification agent that scores incoming leads based on demographics, behavior, and engagement, prioritizes hot prospects for sales teams, sends automated nurture sequences to cold leads, tracks lead progression through the funnel, and integrates with CRM systems like Salesforce, HubSpot, or Pipedrive."
      },
      {
        title: "SEO Analyst",
        description: "Monitor rankings, analyze competitors, optimize content",
        icon: "🔍",
        fullDescription: "An SEO analysis agent that monitors keyword rankings, analyzes competitor strategies, identifies content gaps and opportunities, tracks backlink profiles, audits website technical SEO issues, generates SEO reports, and integrates with tools like Google Analytics, Google Search Console, SEMrush, or Ahrefs."
      },
      {
        title: "Customer Survey Analyst",
        description: "Create surveys, analyze feedback, generate insights",
        icon: "📊",
        fullDescription: "A customer survey analysis agent that creates targeted surveys for different customer segments, distributes surveys through multiple channels, analyzes response data for trends and insights, generates actionable reports for product and marketing teams, and integrates with survey platforms like SurveyMonkey, Typeform, or Qualtrics."
      }
    ]
  },
  {
    name: "Finance",
    icon: "💰",
    agents: [
      {
        title: "Expense Tracker",
        description: "Categorize expenses, flag policy violations, process reimbursements",
        icon: "🧾",
        fullDescription: "An expense tracking agent that automatically categorizes expenses from receipts and credit card transactions, flags policy violations and duplicate submissions, processes reimbursement requests, tracks spending against budgets, generates expense reports for managers, and integrates with platforms like Expensify, Concur, or QuickBooks."
      },
      {
        title: "Invoice Manager",
        description: "Generate, send, and track invoices and payments",
        icon: "📄",
        fullDescription: "An invoice management agent that automatically generates invoices based on delivered services or products, sends payment reminders for overdue accounts, tracks payment status and aging reports, processes recurring billing, handles payment disputes, and integrates with accounting systems like QuickBooks, Xero, or FreshBooks."
      },
      {
        title: "Budget Analyst",
        description: "Monitor spending, forecast trends, alert on variances",
        icon: "📈",
        fullDescription: "A budget analysis agent that monitors departmental spending against approved budgets, forecasts future expenses based on historical trends, alerts managers to budget variances and potential overruns, generates budget vs actual reports, tracks budget approvals, and integrates with ERP systems like NetSuite or SAP."
      },
      {
        title: "Compliance Monitor",
        description: "Track regulatory requirements and audit compliance",
        icon: "⚖️",
        fullDescription: "A compliance monitoring agent that tracks regulatory requirements across different jurisdictions, monitors tax filing deadlines, audits financial transactions for compliance violations, generates compliance reports for auditors, sends alerts for upcoming regulatory changes, and integrates with compliance platforms like Thomson Reuters or Workiva."
      },
      {
        title: "Financial Reporter",
        description: "Generate financial statements and executive dashboards",
        icon: "📋",
        fullDescription: "A financial reporting agent that generates monthly, quarterly, and annual financial statements, creates executive dashboards with key financial metrics, automates variance analysis, produces cash flow forecasts, prepares board presentation materials, and integrates with accounting systems like QuickBooks, NetSuite, or SAP."
      },
      {
        title: "Accounts Payable",
        description: "Process vendor payments and manage cash flow",
        icon: "💳",
        fullDescription: "An accounts payable agent that processes vendor invoices for approval, schedules payments to optimize cash flow, handles vendor inquiries about payment status, manages purchase order matching, tracks early payment discounts, handles vendor onboarding, and integrates with ERP systems like NetSuite, SAP, or Oracle."
      }
    ]
  },
  {
    name: "Operations",
    icon: "⚙️",
    agents: [
      {
        title: "Inventory Manager",
        description: "Track stock levels, automate reordering, manage suppliers",
        icon: "📦",
        fullDescription: "An inventory management agent that tracks stock levels across multiple locations, automatically generates purchase orders when inventory falls below reorder points, manages supplier relationships and lead times, forecasts demand based on historical data, handles stock transfers between locations, and integrates with ERP systems like NetSuite, SAP, or Oracle."
      },
      {
        title: "Supply Chain Coordinator",
        description: "Monitor shipments, manage vendor relationships",
        icon: "🚛",
        fullDescription: "A supply chain coordination agent that monitors shipment tracking across multiple carriers, manages vendor performance scorecards, handles shipping exceptions and delays, coordinates with logistics providers, optimizes shipping routes and costs, tracks delivery confirmations, and integrates with platforms like ShipStation, UPS, FedEx, or DHL APIs."
      },
      {
        title: "Quality Assurance",
        description: "Monitor quality metrics, track defects, manage inspections",
        icon: "✅",
        fullDescription: "A quality assurance agent that monitors product quality metrics, tracks defect rates and root causes, schedules and manages inspection processes, generates quality reports for management, handles customer quality complaints, manages corrective action plans, and integrates with quality management systems like MasterControl or Qualio."
      },
      {
        title: "Process Optimizer",
        description: "Analyze workflows, identify bottlenecks, suggest improvements",
        icon: "🔄",
        fullDescription: "A process optimization agent that analyzes workflow data to identify bottlenecks and inefficiencies, measures process performance against KPIs, suggests automation opportunities, tracks improvement initiatives, generates process documentation, benchmarks against industry standards, and integrates with process mining tools like Celonis or workflow platforms like Zapier."
      },
      {
        title: "Vendor Manager",
        description: "Manage contracts, track performance, handle negotiations",
        icon: "🤝",
        fullDescription: "A vendor management agent that tracks contract expiration dates and renewal opportunities, monitors vendor performance against SLAs, manages the vendor onboarding process, handles contract negotiations and amendments, maintains vendor scorecards, processes vendor payments, and integrates with procurement platforms like Coupa or Ariba."
      },
      {
        title: "Facility Manager",
        description: "Schedule maintenance, manage space allocation, track utilities",
        icon: "🏢",
        fullDescription: "A facility management agent that schedules preventive maintenance for equipment and facilities, manages space allocation and office moves, tracks utility usage and costs, handles maintenance requests from employees, manages vendor relationships for facility services, monitors building security systems, and integrates with CAFM systems like Archibus or FM:Systems."
      }
    ]
  },
  {
    name: "Sales",
    icon: "💼",
    agents: [
      {
        title: "Lead Generator",
        description: "Find prospects, enrich contact data, build target lists",
        icon: "🎯",
        fullDescription: "A lead generation agent that identifies potential prospects based on ideal customer profiles, enriches contact data with job titles and company information, builds targeted prospect lists for outreach campaigns, monitors competitor customers, tracks lead sources and campaign effectiveness, and integrates with tools like ZoomInfo, Apollo.io, or Salesforce."
      },
      {
        title: "Sales Qualifier",
        description: "Score prospects, schedule demos, update CRM",
        icon: "📞",
        fullDescription: "A sales qualification agent that scores prospects based on BANT criteria (Budget, Authority, Need, Timeline), automatically schedules product demos and sales calls, updates CRM records with interaction history, sends follow-up sequences to warm prospects, tracks qualification metrics, and integrates with CRM systems like Salesforce, HubSpot, or Pipedrive."
      },
      {
        title: "Customer Onboarding",
        description: "Guide new customers through setup and training",
        icon: "🎉",
        fullDescription: "A customer onboarding agent that guides new customers through product setup and configuration, schedules training sessions and check-in calls, tracks onboarding milestone completion, sends welcome materials and resources, monitors customer health scores during onboarding, identifies at-risk accounts, and integrates with customer success platforms like Gainsight or ChurnZero."
      },
      {
        title: "Sales Analyst",
        description: "Track metrics, forecast revenue, analyze pipeline",
        icon: "📊",
        fullDescription: "A sales analytics agent that tracks key sales metrics like conversion rates and cycle length, generates revenue forecasts based on pipeline data, analyzes win/loss reasons and deal patterns, creates sales performance dashboards for management, identifies bottlenecks in the sales process, benchmarks against quotas, and integrates with CRM systems and BI tools like Tableau or Power BI."
      },
      {
        title: "Territory Manager",
        description: "Assign leads, balance workloads, track coverage",
        icon: "🗺️",
        fullDescription: "A territory management agent that automatically assigns leads based on geographic territories and rep capacity, balances workloads across the sales team, tracks territory coverage and performance, manages lead routing rules, handles territory conflicts and reassignments, analyzes territory potential, and integrates with CRM systems like Salesforce or Microsoft Dynamics."
      },
      {
        title: "Quote Generator",
        description: "Create proposals, calculate pricing, track approvals",
        icon: "💰",
        fullDescription: "A quote generation agent that creates customized proposals and quotes based on product catalogs and pricing rules, calculates discounts and special pricing, routes quotes for approval based on discount thresholds, tracks quote status and expiration dates, generates contract documents, handles quote revisions, and integrates with CPQ systems like Salesforce CPQ or Oracle CPQ."
      }
    ]
  },
  {
    name: "Customer Service",
    icon: "🎧",
    agents: [
      {
        title: "Support Ticket Manager",
        description: "Triage tickets, assign priorities, track resolution",
        icon: "🎫",
        fullDescription: "A support ticket management agent that automatically triages incoming tickets based on urgency and complexity, assigns appropriate priority levels and categories, routes tickets to the right support agents, tracks SLA compliance, escalates overdue tickets, generates support metrics reports, and integrates with helpdesk platforms like Zendesk, Freshdesk, or ServiceNow."
      },
      {
        title: "Knowledge Base Assistant",
        description: "Answer common questions, update documentation",
        icon: "📚",
        fullDescription: "A knowledge base assistant agent that answers common customer questions using existing documentation, identifies gaps in the knowledge base, suggests new articles based on frequent inquiries, keeps documentation updated with product changes, tracks article usage and effectiveness, provides instant answers to support agents, and integrates with platforms like Confluence, Zendesk Guide, or Freshdesk."
      },
      {
        title: "Customer Feedback Analyzer",
        description: "Analyze reviews, sentiment, and satisfaction scores",
        icon: "💬",
        fullDescription: "A customer feedback analysis agent that analyzes customer reviews, support interactions, and survey responses for sentiment and themes, tracks Net Promoter Score (NPS) and Customer Satisfaction (CSAT) trends, identifies common pain points and feature requests, generates feedback reports for product teams, monitors social media mentions, and integrates with survey tools like SurveyMonkey or feedback platforms like UserVoice."
      },
      {
        title: "Escalation Manager",
        description: "Handle complex issues, manage executive escalations",
        icon: "🚨",
        fullDescription: "An escalation management agent that identifies tickets requiring escalation based on customer tier, issue severity, or SLA breaches, automatically notifies appropriate managers and executives, tracks escalation resolution times, manages executive customer relationships, coordinates cross-departmental responses to complex issues, and integrates with CRM systems and communication tools like Slack or Microsoft Teams."
      },
      {
        title: "Chat Support",
        description: "Provide instant customer support via chat and messaging",
        icon: "💬",
        fullDescription: "A chat support agent that provides instant customer support through website chat, messaging apps, and social media, handles common inquiries with automated responses, seamlessly transfers complex issues to human agents, maintains conversation context across channels, tracks customer satisfaction in real-time, and integrates with platforms like Intercom, Zendesk Chat, or LiveChat."
      },
      {
        title: "Return & Refund Processor",
        description: "Handle returns, process refunds, manage exchanges",
        icon: "↩️",
        fullDescription: "A return and refund processing agent that handles customer return requests and determines eligibility based on policy rules, processes refunds and exchanges automatically, generates return shipping labels, tracks returned merchandise, updates inventory systems, handles warranty claims, communicates status updates to customers, and integrates with ecommerce platforms like Shopify or inventory management systems."
      }
    ]
  },
  {
    name: "IT & Technology",
    icon: "💻",
    agents: [
      {
        title: "System Monitor",
        description: "Monitor infrastructure, alert on issues, track uptime",
        icon: "📡",
        fullDescription: "A system monitoring agent that continuously monitors server performance, network connectivity, and application uptime, sends real-time alerts for outages or performance degradation, tracks SLA compliance, generates uptime reports, predicts potential failures based on trends, manages incident escalation procedures, and integrates with monitoring tools like Datadog, New Relic, or Nagios."
      },
      {
        title: "Security Analyst",
        description: "Monitor threats, analyze logs, manage vulnerabilities",
        icon: "🛡️",
        fullDescription: "A security analysis agent that monitors security logs for threats and anomalies, analyzes vulnerability scan results, tracks security patch compliance, manages security incident response, generates security reports for compliance audits, monitors user access patterns, handles threat intelligence feeds, and integrates with SIEM tools like Splunk, QRadar, or security platforms like CrowdStrike."
      },
      {
        title: "DevOps Assistant",
        description: "Manage deployments, monitor pipelines, automate workflows",
        icon: "🔧",
        fullDescription: "A DevOps assistant agent that manages CI/CD pipeline deployments, monitors build and test results, automates infrastructure provisioning, handles environment configuration, tracks deployment success rates, manages container orchestration, coordinates release schedules, and integrates with tools like Jenkins, GitLab CI, Docker, Kubernetes, and cloud platforms like AWS or Azure."
      },
      {
        title: "Code Reviewer",
        description: "Review code quality, enforce standards, track metrics",
        icon: "👨‍💻",
        fullDescription: "A code review agent that automatically reviews code commits for quality and security issues, enforces coding standards and best practices, tracks code coverage and technical debt metrics, identifies potential bugs and vulnerabilities, manages code review workflows, generates code quality reports, and integrates with version control systems like GitHub, GitLab, or Bitbucket and static analysis tools like SonarQube."
      },
      {
        title: "Documentation Manager",
        description: "Maintain technical docs, track updates, ensure accuracy",
        icon: "📖",
        fullDescription: "A documentation management agent that maintains technical documentation and API references, tracks when documentation needs updates based on code changes, ensures accuracy and completeness of technical guides, manages documentation workflows and approvals, generates documentation from code comments, tracks documentation usage analytics, and integrates with platforms like Confluence, GitBook, or Notion."
      },
      {
        title: "Incident Response",
        description: "Coordinate incident response, track resolution, post-mortems",
        icon: "🚨",
        fullDescription: "An incident response agent that coordinates response to system outages and security incidents, automatically creates incident tickets and war rooms, tracks resolution progress and stakeholder communication, manages escalation procedures, conducts post-incident reviews and root cause analysis, maintains incident response playbooks, and integrates with tools like PagerDuty, Slack, and ITSM platforms like ServiceNow."
      }
    ]
  },
  {
    name: "Legal & Compliance",
    icon: "⚖️",
    agents: [
      {
        title: "Contract Analyzer",
        description: "Review contracts, flag risks, track obligations",
        icon: "📜",
        fullDescription: "A contract analysis agent that reviews legal agreements for standard clauses and potential risks, flags unusual terms for legal review, tracks contract obligations and renewal dates, extracts key terms and metadata, manages contract approval workflows, maintains contract repositories, generates contract analytics, and integrates with contract management platforms like DocuSign CLM or Ironclad."
      },
      {
        title: "Compliance Monitor",
        description: "Track regulations, ensure adherence, manage audits",
        icon: "✅",
        fullDescription: "A compliance monitoring agent that tracks regulatory requirements across different jurisdictions and industries, monitors compliance with data privacy laws like GDPR and CCPA, manages audit schedules and evidence collection, tracks policy acknowledgments and training completion, generates compliance reports for regulators, handles compliance violations, and integrates with GRC platforms like ServiceNow GRC or MetricStream."
      },
      {
        title: "Risk Assessor",
        description: "Identify risks, assess impact, track mitigation",
        icon: "⚠️",
        fullDescription: "A risk assessment agent that identifies potential business, operational, and legal risks, assesses risk impact and probability using standardized frameworks, tracks risk mitigation plans and their effectiveness, monitors risk indicators and triggers, generates risk reports for management and board review, manages risk registers, and integrates with risk management platforms like Resolver or LogicGate."
      },
      {
        title: "Legal Research Assistant",
        description: "Research case law, analyze precedents, track changes",
        icon: "🔍",
        fullDescription: "A legal research assistant agent that researches relevant case law and legal precedents, analyzes regulatory changes and their business impact, tracks legal developments in specific practice areas, maintains legal research databases, generates legal memos and summaries, monitors competitor legal issues, and integrates with legal research platforms like Westlaw, LexisNexis, or Bloomberg Law."
      },
      {
        title: "Policy Manager",
        description: "Maintain policies, track updates, ensure compliance",
        icon: "📋",
        fullDescription: "A policy management agent that maintains corporate policies and procedures, tracks policy review and update schedules, ensures policy compliance across departments, manages policy approval workflows, distributes policy updates to relevant stakeholders, tracks employee policy acknowledgments, generates policy compliance reports, and integrates with document management systems and HR platforms."
      },
      {
        title: "Audit Coordinator",
        description: "Coordinate audits, collect evidence, track findings",
        icon: "🔍",
        fullDescription: "An audit coordination agent that coordinates internal and external audit processes, collects and organizes audit evidence and documentation, tracks audit findings and remediation plans, manages auditor communications and schedules, maintains audit trails and documentation, generates audit reports and dashboards, handles audit follow-up activities, and integrates with audit management platforms like Workiva or AuditBoard."
      }
    ]
  },
  {
    name: "Project Management",
    icon: "📋",
    agents: [
      {
        title: "Task Coordinator",
        description: "Assign tasks, track progress, manage dependencies",
        icon: "✅",
        fullDescription: "A task coordination agent that assigns tasks based on team capacity and skills, tracks task progress and completion rates, manages task dependencies and critical path, sends automated reminders for overdue tasks, coordinates task handoffs between team members, generates task reports and dashboards, and integrates with project management tools like Jira, Asana, Monday.com, or Microsoft Project."
      },
      {
        title: "Timeline Manager",
        description: "Create schedules, track milestones, adjust timelines",
        icon: "📅",
        fullDescription: "A timeline management agent that creates detailed project schedules and milestones, tracks progress against planned timelines, identifies potential delays and bottlenecks, automatically adjusts schedules based on task updates, manages resource allocation across timeline, sends milestone notifications to stakeholders, and integrates with scheduling tools like Microsoft Project, Smartsheet, or Gantt chart applications."
      },
      {
        title: "Resource Allocator",
        description: "Manage team capacity, allocate resources, track utilization",
        icon: "👥",
        fullDescription: "A resource allocation agent that manages team capacity and availability, allocates resources across multiple projects based on skills and workload, tracks resource utilization rates, identifies resource conflicts and overallocation, forecasts resource needs for upcoming projects, manages contractor and freelancer assignments, and integrates with resource management tools like Float, Resource Guru, or Harvest."
      },
      {
        title: "Status Reporter",
        description: "Generate reports, track KPIs, communicate updates",
        icon: "📊",
        fullDescription: "A status reporting agent that generates automated project status reports for stakeholders, tracks key project KPIs like budget variance and schedule adherence, creates executive dashboards with project health indicators, sends regular status updates to team members and sponsors, identifies projects at risk, compiles milestone achievement reports, and integrates with BI tools like Tableau or Power BI."
      },
      {
        title: "Risk Manager",
        description: "Identify risks, track mitigation, assess impact",
        icon: "⚠️",
        fullDescription: "A project risk management agent that identifies potential project risks during planning and execution, assesses risk probability and impact using standardized matrices, tracks risk mitigation plans and their effectiveness, monitors risk triggers and early warning indicators, maintains project risk registers, escalates high-impact risks to stakeholders, and integrates with risk management tools and project platforms."
      },
      {
        title: "Stakeholder Communicator",
        description: "Manage communications, schedule meetings, track feedback",
        icon: "📢",
        fullDescription: "A stakeholder communication agent that manages project communication plans and schedules, sends targeted updates to different stakeholder groups, schedules and coordinates project meetings and reviews, tracks stakeholder feedback and requirements changes, manages approval workflows, maintains communication logs and decision records, and integrates with collaboration tools like Slack, Microsoft Teams, or Zoom."
      }
    ]
  },
  {
    name: "Data & Analytics",
    icon: "📊",
    agents: [
      {
        title: "Business Intelligence Analyst",
        description: "Create dashboards, analyze trends, generate insights",
        icon: "📈",
        fullDescription: "A business intelligence analyst agent that creates interactive dashboards and reports for executives and managers, analyzes business trends and performance metrics, generates actionable insights from data patterns, performs competitive analysis and market research, tracks KPIs across departments, creates data visualizations and presentations, and integrates with BI tools like Tableau, Power BI, or Looker."
      },
      {
        title: "Data Quality Monitor",
        description: "Validate data, detect anomalies, ensure accuracy",
        icon: "🔍",
        fullDescription: "A data quality monitoring agent that validates data accuracy and completeness across databases, detects data anomalies and inconsistencies, monitors data pipeline health and performance, tracks data lineage and transformation processes, generates data quality reports and alerts, implements data cleansing rules, and integrates with data quality tools like Informatica, Talend, or Great Expectations."
      },
      {
        title: "Report Generator",
        description: "Automate reports, schedule delivery, track usage",
        icon: "📋",
        fullDescription: "A report generation agent that automates the creation of regular business reports, schedules report delivery to stakeholders via email or portals, customizes report formats and content based on audience, tracks report usage and engagement metrics, manages report distribution lists, handles report exceptions and failures, and integrates with reporting tools like Crystal Reports, SSRS, or business intelligence platforms."
      },
      {
        title: "Trend Analyzer",
        description: "Identify patterns, forecast trends, predict outcomes",
        icon: "📈",
        fullDescription: "A trend analysis agent that identifies patterns and trends in business and market data, performs statistical analysis and forecasting, predicts future outcomes using machine learning models, analyzes seasonal and cyclical patterns, tracks performance against forecasts, generates trend reports and recommendations, and integrates with analytics platforms like R, Python, SAS, or cloud ML services."
      },
      {
        title: "Dashboard Manager",
        description: "Maintain dashboards, ensure data freshness, manage access",
        icon: "📊",
        fullDescription: "A dashboard management agent that maintains and updates business dashboards, ensures data freshness and accuracy in visualizations, manages user access and permissions to different dashboards, tracks dashboard performance and load times, optimizes queries and data sources, handles dashboard deployment and versioning, and integrates with dashboard platforms like Tableau Server, Power BI Service, or custom web applications."
      },
      {
        title: "Data Migration Assistant",
        description: "Plan migrations, validate transfers, minimize downtime",
        icon: "🔄",
        fullDescription: "A data migration assistant agent that plans and coordinates data migration projects between systems, validates data integrity before and after transfers, maps data schemas and transformations, schedules migrations to minimize business impact, monitors migration progress and performance, handles rollback procedures for failed migrations, and integrates with ETL tools like Informatica, SSIS, or cloud migration services."
      }
    ]
  }
]

type Phase = 'input' | 'clarification' | 'building' | 'complete' | 'error'

interface ParsedAgent {
  description: string
  requirements: string[]
  constraints: string[]
  mentionedTools: string[]
  impliedCapabilities: string[]
}

interface Tool {
  name: string
  description: string
  selected: boolean
}

export function AgentBuilder() {
  const [phase, setPhase] = useState<Phase>('input')
  const [description, setDescription] = useState('')
  const [parsedAgent, setParsedAgent] = useState<ParsedAgent | null>(null)
  const [availableTools, setAvailableTools] = useState<Tool[]>([])
  const [userTools, setUserTools] = useState<string[]>([])
  const [toolInput, setToolInput] = useState('')
  const [needsSuggestions, setNeedsSuggestions] = useState(false)
  const [suggestedTools, setSuggestedTools] = useState<string[]>([])
  const [isBuilding, setIsBuilding] = useState(false)
  const [buildSteps, setBuildSteps] = useState(BUILD_STEPS)
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [agentResult, setAgentResult] = useState(null)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Human Resources')

  const handleParseDescription = async () => {
    if (!description.trim()) return

    setPhase('clarification')
    setError('')

    try {
      const response = await fetch('http://localhost:3000/api/agent/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description })
      })

      if (!response.ok) {
        throw new Error('Failed to parse description')
      }

      const parsed = await response.json()
      setParsedAgent(parsed)

    } catch (error) {
      setError('Failed to analyze your agent description. Please try again.')
      setPhase('error')
    }
  }

  const handleBuildAgent = async () => {
    if (!parsedAgent) return

    setPhase('building')
    setIsBuilding(true)
    setCurrentStepIndex(0)
    setError('')
    
    // Reset steps
    setBuildSteps(BUILD_STEPS.map(step => ({ ...step, status: 'pending' })))

    try {
      // Step-by-step build process
      for (let i = 0; i < BUILD_STEPS.length; i++) {
        // Update current step to in_progress
        setBuildSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index === i ? 'in_progress' : index < i ? 'completed' : 'pending'
        })))
        setCurrentStepIndex(i)

        // Add realistic delays
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000))

        // Mark step as completed
        setBuildSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index <= i ? 'completed' : 'pending'
        })))
      }

      // Combine all tools: mentioned + user-added
      const allTools = [
        ...(parsedAgent.mentionedTools || []),
        ...userTools
      ]

      // Make actual API call to create agent with all tools
      const response = await fetch('http://localhost:3000/api/agent/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          description: parsedAgent.description,
          mentionedTools: allTools // Pass combined tools
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create agent')
      }

      const result = await response.json()
      setAgentResult(result)
      setPhase('complete')

    } catch (error) {
      console.error('Failed to build agent:', error)
      setError('Failed to build your agent. Please try again.')
      setPhase('error')
    } finally {
      setIsBuilding(false)
      setCurrentStepIndex(-1)
    }
  }

  const handleStartOver = () => {
    setPhase('input')
    setDescription('')
    setParsedAgent(null)
    setAvailableTools([])
    setUserTools([])
    setToolInput('')
    setNeedsSuggestions(false)
    setSuggestedTools([])
    setAgentResult(null)
    setError('')
    setSelectedCategory('Human Resources')
    setBuildSteps(BUILD_STEPS.map(step => ({ ...step, status: 'pending' })))
  }

  const addTool = (toolName: string) => {
    const trimmedTool = toolName.trim()
    if (trimmedTool && !userTools.includes(trimmedTool)) {
      setUserTools(prev => [...prev, trimmedTool])
      setToolInput('')
    }
  }

  const removeTool = (toolName: string) => {
    setUserTools(prev => prev.filter(tool => tool !== toolName))
  }

  const handleToolInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTool(toolInput)
    }
  }

  const handleSuggestTools = async () => {
    if (!parsedAgent) return
    
    setNeedsSuggestions(true)
    
    try {
      // Generate tool suggestions based on capabilities
      const suggestions = await generateToolSuggestions(parsedAgent)
      setSuggestedTools(suggestions)
    } catch (error) {
      console.error('Failed to generate tool suggestions:', error)
    }
  }

  const generateToolSuggestions = async (agent: ParsedAgent): Promise<string[]> => {
    // Simple rule-based suggestions for now
    const suggestions: string[] = []
    
    agent.impliedCapabilities.forEach(capability => {
      const lowerCap = capability.toLowerCase()
      
      if (lowerCap.includes('ticket') || lowerCap.includes('support')) {
        suggestions.push('Zendesk', 'Jira Service Management', 'Freshdesk')
      }
      if (lowerCap.includes('knowledge') || lowerCap.includes('documentation')) {
        suggestions.push('Confluence', 'Notion', 'GitBook')
      }
      if (lowerCap.includes('communication') || lowerCap.includes('notification')) {
        suggestions.push('Slack', 'Microsoft Teams', 'Discord')
      }
      if (lowerCap.includes('project') || lowerCap.includes('task')) {
        suggestions.push('Jira', 'Trello', 'Asana')
      }
      if (lowerCap.includes('email')) {
        suggestions.push('Gmail API', 'Outlook API', 'SendGrid')
      }
      if (lowerCap.includes('database') || lowerCap.includes('data')) {
        suggestions.push('MySQL', 'PostgreSQL', 'MongoDB')
      }
    })
    
    // Remove duplicates and return unique suggestions
    return [...new Set(suggestions)].slice(0, 6)
  }

  const getProgress = () => {
    const completedSteps = buildSteps.filter(step => step.status === 'completed').length
    return (completedSteps / buildSteps.length) * 100
  }

  // Error State
  if (phase === 'error') {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h2 className="text-lg font-semibold text-red-900">Something went wrong</h2>
              </div>
              <p className="text-red-700 mb-4">{error}</p>
              <Button onClick={handleStartOver} variant="outline">
                Start Over
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Completion State
  if (phase === 'complete' && agentResult) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🎉 Your Agent is Ready!
            </h1>
            <p className="text-xl text-gray-600">
              {agentResult.agent.name} has been successfully created
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Agent Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Agent Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{agentResult.agent.name}</h3>
                  <p className="text-gray-600 mt-1">{agentResult.agent.description}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Capabilities</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {agentResult.agent.capabilities.map((capability, index) => (
                      <li key={index}>{capability}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tools Integrated</h4>
                  <div className="flex flex-wrap gap-2">
                    {agentResult.agent.tools && agentResult.agent.tools.length > 0 ? (
                      agentResult.agent.tools.map((tool, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                        >
                          {tool.name}
                        </span>
                      ))
                    ) : (
                      <div className="text-gray-500 text-sm">
                        No specific tools were mentioned or researched for this agent.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Implementation Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Implementation Plan
                </CardTitle>
                <CardDescription>
                  Estimated time: {agentResult.plan.totalEstimatedTime}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {agentResult.plan.steps.slice(0, 5).map((step, index) => (
                    <div key={step.id} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{step.title}</h4>
                        <p className="text-gray-600 text-xs mt-1">{step.description}</p>
                        <span className="text-xs text-gray-500">{step.estimatedTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <Button onClick={handleStartOver}>
              Build Another Agent
            </Button>
            <Button variant="outline">
              Deploy Agent
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI Agent Builder
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Describe your ideal AI agent and we'll research the tools, create a plan, 
            and build it for you automatically.
          </p>
        </div>

        {/* Input Phase */}
        {phase === 'input' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Describe Your Agent</CardTitle>
              <CardDescription>
                Tell us what you want your AI agent to do. Be as specific as possible about its capabilities and use cases.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Example: A customer support agent that can search our knowledge base, create support tickets, and escalate issues to human agents when needed. It should integrate with Zendesk and have access to our product documentation."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px] resize-none"
              />
              <Button 
                onClick={handleParseDescription}
                disabled={!description.trim()}
                size="lg"
                className="w-full"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Analyze My Agent
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Clarification Phase */}
        {phase === 'clarification' && parsedAgent && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  I understand your agent
                </CardTitle>
                <CardDescription>
                  Here's what I found. Please review and customize before building.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Agent Purpose</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{parsedAgent.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Key Capabilities</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {parsedAgent.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>

                {parsedAgent.mentionedTools && parsedAgent.mentionedTools.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Tools You Mentioned</h3>
                    <div className="flex flex-wrap gap-2">
                      {parsedAgent.mentionedTools.map((tool, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {parsedAgent.impliedCapabilities && parsedAgent.impliedCapabilities.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Capabilities Needed</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {parsedAgent.impliedCapabilities.map((capability, index) => (
                        <li key={index}>{capability}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tool Selection Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    What tools do you want to integrate?
                  </h3>
                  
                  {/* Combined Tools Display */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {/* Mentioned Tools */}
                      {parsedAgent.mentionedTools && parsedAgent.mentionedTools.map((tool, index) => (
                        <span 
                          key={`mentioned-${index}`}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1"
                        >
                          {tool}
                          <CheckCircle2 className="w-3 h-3" />
                        </span>
                      ))}
                      
                      {/* User Added Tools */}
                      {userTools.map((tool, index) => (
                        <span 
                          key={`user-${index}`}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-1"
                        >
                          {tool}
                          <button
                            onClick={() => removeTool(tool)}
                            className="hover:bg-blue-200 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Add Tool Input */}
                  <div className="mb-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a tool (e.g., Slack, Jira, Confluence)..."
                        value={toolInput}
                        onChange={(e) => setToolInput(e.target.value)}
                        onKeyPress={handleToolInputKeyPress}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Button 
                        onClick={() => addTool(toolInput)}
                        size="sm"
                        disabled={!toolInput.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Press Enter or click + to add</p>
                  </div>

                  {/* Suggestion Options */}
                  <div className="flex gap-2 text-sm">
                    <Button
                      onClick={handleSuggestTools}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Lightbulb className="w-3 h-3" />
                      Suggest Tools
                    </Button>
                    <span className="text-gray-500 self-center">or add your own above</span>
                  </div>

                  {/* Tool Suggestions */}
                  {needsSuggestions && suggestedTools.length > 0 && (
                    <div className="mt-3 p-3 bg-white rounded-md border border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">Suggested tools for your use case:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedTools.map((tool, index) => (
                          <button
                            key={index}
                            onClick={() => addTool(tool)}
                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs transition-colors"
                          >
                            + {tool}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {parsedAgent.constraints && parsedAgent.constraints.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Constraints</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {parsedAgent.constraints.map((constraint, index) => (
                        <li key={index}>{constraint}</li>
                      ))}
                    </ul>
                  </div>
                )}


                <div className="flex gap-3">
                  <Button onClick={() => setPhase('input')} variant="outline" className="flex-1">
                    ← Back to Edit
                  </Button>
                  <Button onClick={handleBuildAgent} className="flex-1">
                    <Zap className="w-4 h-4 mr-2" />
                    Build My Agent
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Building Phase */}
        {phase === 'building' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Building Your Agent...
              </CardTitle>
              <CardDescription>
                This may take a few minutes while we research tools and create your agent.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Progress value={getProgress()} className="w-full" />
              
              <div className="space-y-4">
                {buildSteps.map((step, index) => {
                  const Icon = step.icon
                  const isActive = index === currentStepIndex
                  const isCompleted = step.status === 'completed'
                  const isPending = step.status === 'pending'

                  return (
                    <div key={step.id} className="flex items-center gap-4">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${isCompleted ? 'bg-green-100 text-green-600' : 
                          isActive ? 'bg-blue-100 text-blue-600' : 
                          'bg-gray-100 text-gray-400'}
                      `}>
                        {isActive ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          isCompleted ? 'text-green-900' :
                          isActive ? 'text-blue-900' :
                          'text-gray-500'
                        }`}>
                          {step.title}
                        </h3>
                        <p className={`text-sm ${
                          isCompleted ? 'text-green-600' :
                          isActive ? 'text-blue-600' :
                          'text-gray-400'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Popular Agent Types */}
        {phase === 'input' && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Popular Agent Types
            </h2>
            
            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {AGENT_CATEGORIES.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                    ${selectedCategory === category.name 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <span>{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>

            {/* Selected Category Agents */}
            <div className="bg-gray-50 rounded-lg p-6">
              {AGENT_CATEGORIES
                .filter(category => category.name === selectedCategory)
                .map((category) => (
                  <div key={category.name}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.agents.map((agent) => (
                        <Card 
                          key={`${category.name}-${agent.title}`}
                          className="cursor-pointer hover:shadow-md transition-all hover:scale-105 bg-white"
                          onClick={() => setDescription(agent.fullDescription)}
                        >
                          <CardContent className="pt-4 pb-4">
                            <div className="text-center">
                              <div className="text-2xl mb-2">{agent.icon}</div>
                              <h4 className="font-semibold text-gray-900 text-sm mb-1">{agent.title}</h4>
                              <p className="text-xs text-gray-600 leading-relaxed">{agent.description}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>
    </div>
  )
}