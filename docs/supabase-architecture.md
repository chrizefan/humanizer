```mermaid
graph TD
    subgraph Client
        NextJS[Next.js App]
        AuthComponents[Auth Components]
        ProjectComponents[Project Components]
        CreditComponents[Credit Components]
    end
    
    subgraph "API Routes"
        HumanizeAPI[/api/humanize]
        ProjectsAPI[/api/projects]
        ProjectAPI[/api/projects/[id]]
        CreditsAPI[/api/credits]
        PurchaseAPI[/api/credits/purchase]
        SubscriptionAPI[/api/subscription]
    end
    
    subgraph "Supabase Client"
        Auth[Authentication]
        DB[Database Operations]
        Storage[File Storage]
    end
    
    subgraph "Supabase Backend"
        SupabaseAuth[Auth Service]
        PostgreSQL[PostgreSQL Database]
        SupabaseStorage[Object Storage]
        RLS[Row Level Security]
    end
    
    NextJS --> AuthComponents
    NextJS --> ProjectComponents
    NextJS --> CreditComponents
    
    AuthComponents --> Auth
    ProjectComponents --> ProjectsAPI
    ProjectComponents --> ProjectAPI
    CreditComponents --> CreditsAPI
    CreditComponents --> PurchaseAPI
    CreditComponents --> SubscriptionAPI
    
    HumanizeAPI --> Auth
    HumanizeAPI --> DB
    ProjectsAPI --> Auth
    ProjectsAPI --> DB
    ProjectAPI --> Auth
    ProjectAPI --> DB
    CreditsAPI --> Auth
    CreditsAPI --> DB
    PurchaseAPI --> Auth
    PurchaseAPI --> DB
    SubscriptionAPI --> Auth
    SubscriptionAPI --> DB
    
    Auth --> SupabaseAuth
    DB --> PostgreSQL
    Storage --> SupabaseStorage
    
    PostgreSQL --> RLS
    
    classDef api fill:#f9f,stroke:#333,stroke-width:2px;
    classDef client fill:#bbf,stroke:#333,stroke-width:1px;
    classDef supabase fill:#bfb,stroke:#333,stroke-width:1px;
    
    class HumanizeAPI,ProjectsAPI,ProjectAPI,CreditsAPI,PurchaseAPI,SubscriptionAPI api;
    class NextJS,AuthComponents,ProjectComponents,CreditComponents client;
    class Auth,DB,Storage,SupabaseAuth,PostgreSQL,SupabaseStorage,RLS supabase;
```
