'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { TipCard } from '../components/tips/TipCard';
import { CodeBlock } from '@/components/ui/code-block';
import {
  Rocket,
  Settings,
  Key,
  Server,
  GitBranch,
  CheckCircle,
  Check,
  AlertCircle,
  Copy,
  ArrowUpRight,
} from 'lucide-react';

// YAML workflow content as constants to avoid parsing issues
const BUILD_WORKFLOW_YAML = `name: Build Staging

on:
  push:
    tags:
      - "v-staging-*"

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Setup Git
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Create .env file
        run: |
          echo "MACHINA_API_KEY=\${{ vars.MACHINA_API_KEY }}" >> .env
          echo "MACHINA_CLIENT_URL=\${{ vars.MACHINA_CLIENT_URL }}" >> .env
          echo "NEXT_PUBLIC_BRAND=\${{ vars.NEXT_PUBLIC_BRAND }}" >> .env
          echo "NEXT_PUBLIC_APP_NAME=\${{ vars.NEXT_PUBLIC_APP_NAME }}" >> .env
          echo "NEXT_PUBLIC_API_BASE_URL=\${{ vars.NEXT_PUBLIC_API_BASE_URL }}" >> .env
          echo "NODE_ENV=production" >> .env

      - name: Get tag name as release version
        run: echo "PACKAGE_VERSION=\${GITHUB_REF#refs/tags/}" >> $GITHUB_ENV

      - name: Login to Docker Hub
        uses: docker/login-action@v1
        with:
          username: \${{ secrets.DOCKER_USERNAME }}
          password: \${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v2
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: |
            \${{ secrets.REGISTRY_URL }}/app-name:\${{ env.PACKAGE_VERSION }} \
            \${{ secrets.REGISTRY_URL }}/app-name:staging-latest `;

const RELEASE_WORKFLOW_YAML = `name: Release Staging

on:
  workflow_dispatch:
    inputs:
      image_tag:
        description: 'Image tag to deploy (e.g., v.staging-1.0.0)'
        required: true
        type: string

env:
  AKS_CLUSTER_NAME: mks-community-cluster
  AKS_RESOURCE_GROUP: mks-community-group
  NAMESPACE: default
  APP_NAME: app-name
  DEPLOYMENT_NAME: app-name
  CONTAINER_NAME: app-name

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Set image tag
        run: echo "IMAGE_TAG=\${{ github.event.inputs.image_tag }}" >> \$GITHUB_ENV

      - name: Login to Azure
        uses: azure/login@v1
        with:
          creds: \${{ secrets.AZURE_CREDENTIALS }}

      - name: Get AKS credentials
        uses: azure/aks-set-context@v3
        with:
          cluster-name: \${{ env.AKS_CLUSTER_NAME }}
          resource-group: \${{ env.AKS_RESOURCE_GROUP }}

      - name: Deploy to AKS
        run: |
          kubectl set image deployment/\${{ env.DEPLOYMENT_NAME }} \\
            \${{ env.CONTAINER_NAME }}=\${{ secrets.REGISTRY_URL }}/\${{ env.APP_NAME }}:\${{ env.IMAGE_TAG }} \\
            -n \${{ env.NAMESPACE }}
          kubectl rollout status deployment/\${{ env.DEPLOYMENT_NAME }} \\
            -n \${{ env.NAMESPACE }}`;

interface CopyButtonProps {
  text: string;
  section: string;
  label: string;
  copiedSection: string | null;
  onCopy: (text: string, section: string) => void;
}

const CopyButton = ({ text, section, label, copiedSection, onCopy }: CopyButtonProps) => (
  <button
    onClick={() => onCopy(text, section)}
    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
      copiedSection === section
        ? 'bg-green-500 text-white dark:bg-green-600'
        : 'bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700'
    }`}
  >
    {copiedSection === section ? (
      <>
        <Check size={14} />
        Copied!
      </>
    ) : (
      <>
        <Copy size={14} />
        {label}
      </>
    )}
  </button>
);

const DeployPage = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start gap-10 bg-zinc-50 px-6 py-16 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      {/* Header Section */}
      <div className="flex max-w-4xl flex-col items-center gap-8 text-center">
        <div className="space-y-4">
          <div className="inline-flex items-center rounded-full border border-[#ff6d00]/20 bg-[#ff6d00]/10 px-3 py-1 text-xs font-medium text-[#ff6d00] ring-1 ring-[#ff6d00]/20 ring-inset">
            Cloud & Infrastructure
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-zinc-900 sm:text-6xl dark:text-white">
            Deployment <span className="text-[#ff6d00]">Guide</span>
          </h1>
          <p className="mx-auto max-w-[42rem] text-lg leading-normal text-balance text-zinc-600 sm:text-xl dark:text-zinc-400">
            Complete guide to setting up CI/CD workflows for new Machina Frontend applications.
            Automate your delivery pipeline with industry best practices.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-2">
          <Link
            href="/"
            className="group flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Back to Home
            <ArrowUpRight size={14} className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
          </Link>
          <Link
            href="/docs"
            className="group flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Read Documentation
            <ArrowUpRight size={14} className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
          </Link>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-2">
        {/* Prerequisites */}
        <TipCard
          title="Prerequisites"
          description="Required infrastructure and credentials before setting up deployment workflows."
          icon={<Settings size={20} />}
          className="md:col-span-2"
        >
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">Infrastructure</h4>
              <ul className="ml-4 list-disc space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                <li>Azure AKS (Kubernetes cluster)</li>
                <li>Docker Registry (Azure Container Registry or Docker Hub)</li>
                <li>GitHub Repository with Actions enabled</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">
                Required Credentials
              </h4>
              <ul className="ml-4 list-disc space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                <li>Azure credentials (AZURE_CREDENTIALS)</li>
                <li>Docker registry credentials (DOCKER_USERNAME, DOCKER_PASSWORD)</li>
                <li>Registry URL (REGISTRY_URL)</li>
                <li>API credentials (MACHINA_API_KEY, MACHINA_CLIENT_URL)</li>
              </ul>
            </div>
          </div>
        </TipCard>

        {/* GitHub Secrets Setup */}
        <TipCard
          title="GitHub Secrets Configuration"
          description="Configure repository secrets and variables in GitHub Settings → Secrets and variables → Actions."
          icon={<Key size={20} />}
          className="md:col-span-2"
        >
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">
                Repository Secrets
              </h4>
              <div className="rounded-md bg-zinc-50 p-3 dark:bg-zinc-800">
                <code className="block text-xs text-zinc-800 dark:text-zinc-200">
                  DOCKER_USERNAME
                  <br />
                  DOCKER_PASSWORD
                  <br />
                  REGISTRY_URL
                  <br />
                  AZURE_CREDENTIALS
                </code>
              </div>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">
                Repository Variables
              </h4>
              <div className="rounded-md bg-zinc-50 p-3 dark:bg-zinc-800">
                <code className="block text-xs text-zinc-800 dark:text-zinc-200">
                  MACHINA_API_KEY
                  <br />
                  MACHINA_CLIENT_URL
                  <br />
                  NEXT_PUBLIC_BRAND
                  <br />
                  NEXT_PUBLIC_APP_NAME
                  <br />
                  NEXT_PUBLIC_API_BASE_URL
                </code>
              </div>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-800 dark:bg-blue-900/10">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                <strong>Note:</strong> Secrets are encrypted and only accessible during workflow
                execution. Variables are visible in workflow logs.
              </p>
            </div>
          </div>
        </TipCard>

        {/* Build Workflow */}
        <TipCard
          title="Build Workflow"
          description="Automatically builds and pushes Docker images when a staging tag is pushed."
          icon={<Rocket size={20} />}
          className="md:col-span-2"
        >
          <div className="space-y-4">
            <div>
              <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                This workflow triggers on push of tags matching <code>v.staging-*</code> pattern. It
                builds the Next.js app, creates a Docker image, and pushes it to your registry.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Workflow File:
                  </span>
                  <CopyButton
                    text=".github/workflows/build-staging.yml"
                    section="build-file"
                    label="Copy Path"
                    copiedSection={copiedSection}
                    onCopy={handleCopy}
                  />
                </div>
                <CodeBlock className="language-yaml">
                  {`name: Build Staging

on:
  push:
    tags:
      - "v.staging-*"

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Setup Git
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Create .env file
        run: |
          echo "MACHINA_API_KEY=${'{'}{'{'}vars.MACHINA_API_KEY{'}'}{'}'}" >> .env
          echo "MACHINA_CLIENT_URL=${'{'}{'{'}vars.MACHINA_CLIENT_URL{'}'}{'}'}" >> .env
          echo "NEXT_PUBLIC_BRAND=${'{'}{'{'}vars.NEXT_PUBLIC_BRAND{'}'}{'}'}" >> .env
          echo "NEXT_PUBLIC_APP_NAME=${'{'}{'{'}vars.NEXT_PUBLIC_APP_NAME{'}'}{'}'}" >> .env
          echo "NEXT_PUBLIC_API_BASE_URL=${'{'}{'{'}vars.NEXT_PUBLIC_API_BASE_URL{'}'}{'}'}" >> .env
          echo "NODE_ENV=production" >> .env

      - name: Get tag name as release version
        run: echo "PACKAGE_VERSION=\\\${GITHUB_REF#refs/tags/}" >> $GITHUB_ENV

      - name: Login to Docker Hub
        uses: docker/login-action@v1
        with:
          username: \${'{'}{'{'}} secrets.DOCKER_USERNAME \${'}'}{{'}'}}
          password: \${'{'}{'{'}} secrets.DOCKER_PASSWORD \${'}'}{{'}'}}

      - name: Build and push Docker image
        uses: docker/build-push-action@v2
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: |
            \${'{'}{'{'}} secrets.REGISTRY_URL \${'}'}{{'}'}}/app-name:\${PACKAGE_VERSION}
            \${'{'}{'{'}} secrets.REGISTRY_URL \${'}'}{{'}'}}/app-name:staging-latest`}
                </CodeBlock>
              </div>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50/50 p-3 dark:border-green-800 dark:bg-green-900/10">
              <p className="text-xs text-green-800 dark:text-green-300">
                <strong>Usage:</strong> Create and push a staging tag to trigger the build:
                <br />
                <code className="mt-1 block">
                  git tag v.staging-1.0.0 && git push origin v.staging-1.0.0
                </code>
              </p>
            </div>
          </div>
        </TipCard>

        {/* Release Workflow */}
        <TipCard
          title="Release Workflow"
          description="Manually deploy a specific Docker image tag to Kubernetes."
          icon={<Server size={20} />}
          className="md:col-span-2"
        >
          <div className="space-y-4">
            <div>
              <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                This workflow is manually triggered from GitHub Actions. It updates the Kubernetes
                deployment with a specific image tag and waits for rollout completion.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Workflow File:
                  </span>
                  <CopyButton
                    text=".github/workflows/release-staging.yml"
                    section="release-file"
                    label="Copy Path"
                    copiedSection={copiedSection}
                    onCopy={handleCopy}
                  />
                </div>
                <CodeBlock className="language-yaml">{RELEASE_WORKFLOW_YAML}</CodeBlock>
              </div>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-800 dark:bg-blue-900/10">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                <strong>Usage:</strong> Go to GitHub → Actions → Release Staging → Run workflow.
                Enter the image tag (e.g., v.staging-1.0.0) and click Run workflow.
              </p>
            </div>
          </div>
        </TipCard>

        {/* Kubernetes Setup */}
        <TipCard
          title="Kubernetes Configuration"
          description="Deployment, Service, and Ingress manifests for your application."
          icon={<Server size={20} />}
          className="md:col-span-2"
        >
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">Required Files</h4>
              <ul className="ml-4 list-disc space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                <li>
                  <code>k8s/deployment.yaml</code> - Application deployment configuration
                </li>
                <li>
                  <code>k8s/service.yaml</code> - Service to expose pods
                </li>
                <li>
                  <code>k8s/ingress.yaml</code> - Ingress for external access
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">Initial Setup</h4>
              <div className="rounded-md bg-zinc-50 p-3 dark:bg-zinc-800">
                <CopyButton
                  text={`az login
az aks get-credentials --resource-group mks-community-group --name mks-community-cluster

kubectl create secret docker-registry regcred \\
  --docker-server=myregistry.azurecr.io \\
  --docker-username=username \\
  --docker-password=password \\
  -n default

kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml`}
                  section="k8s-setup"
                  label="Copy Commands"
                  copiedSection={copiedSection}
                  onCopy={handleCopy}
                />
                <code className="mt-2 block text-xs text-zinc-800 dark:text-zinc-200">
                  az login
                  <br />
                  az aks get-credentials --resource-group mks-community-group --name
                  mks-community-cluster
                  <br />
                  <br />
                  kubectl create secret docker-registry regcred \
                  <br />
                  &nbsp;&nbsp;--docker-server=myregistry.azurecr.io \
                  <br />
                  &nbsp;&nbsp;--docker-username=username \
                  <br />
                  &nbsp;&nbsp;--docker-password=password \
                  <br />
                  &nbsp;&nbsp;-n default
                  <br />
                  <br />
                  kubectl apply -f k8s/deployment.yaml
                  <br />
                  kubectl apply -f k8s/service.yaml
                  <br />
                  kubectl apply -f k8s/ingress.yaml
                </code>
              </div>
            </div>
          </div>
        </TipCard>

        {/* Deployment Process */}
        <TipCard
          title="Deployment Process"
          description="Step-by-step guide to deploy a new application."
          icon={<GitBranch size={20} />}
          className="md:col-span-2"
        >
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-50">
                    Customize Workflows
                  </h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Edit <code>.github/workflows/build-staging.yml</code> and{' '}
                    <code>.github/workflows/release-staging.yml</code>. Replace{' '}
                    <code>app-name</code> with your application name and update cluster/resource
                    group names.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-50">
                    Configure GitHub Secrets
                  </h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Add all required secrets and variables in GitHub Settings → Secrets and
                    variables → Actions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-50">
                    Setup Kubernetes
                  </h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Create registry secret and apply Kubernetes manifests. Ensure your{' '}
                    <code>k8s/</code> files are customized for your application.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-50">
                    Build and Deploy
                  </h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Create a staging tag to trigger the build workflow. Once complete, manually
                    trigger the release workflow with the image tag.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TipCard>

        {/* Troubleshooting */}
        <TipCard
          title="Troubleshooting"
          description="Common issues and solutions during deployment."
          icon={<AlertCircle size={20} />}
          className="md:col-span-2"
        >
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">
                ImagePullBackOff Error
              </h4>
              <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
                Verify the registry secret exists and credentials are correct:
              </p>
              <div className="rounded-md bg-zinc-50 p-3 dark:bg-zinc-800">
                <code className="block text-xs text-zinc-800 dark:text-zinc-200">
                  kubectl get secret regcred -n default
                  <br />
                  kubectl describe pod &lt;pod-name&gt; -n default
                </code>
              </div>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">
                Workflow Not Triggering
              </h4>
              <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
                Ensure the tag follows the exact pattern <code>v.staging-*</code>:
              </p>
              <div className="rounded-md bg-zinc-50 p-3 dark:bg-zinc-800">
                <code className="block text-xs text-zinc-800 dark:text-zinc-200">
                  git tag v.staging-1.0.0
                  <br />
                  git push origin v.staging-1.0.0
                </code>
              </div>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">
                Deployment Rollout Fails
              </h4>
              <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
                Check pod logs and events:
              </p>
              <div className="rounded-md bg-zinc-50 p-3 dark:bg-zinc-800">
                <code className="block text-xs text-zinc-800 dark:text-zinc-200">
                  kubectl logs deployment/app-name -n default --tail=100
                  <br />
                  kubectl get events -n default --sort-by=&quot;.lastTimestamp&quot;
                </code>
              </div>
            </div>
          </div>
        </TipCard>

        {/* Checklist */}
        <TipCard
          title="Deployment Checklist"
          description="Verify all steps before deploying to production."
          icon={<CheckCircle size={20} />}
          className="md:col-span-2"
        >
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input type="checkbox" className="rounded border-zinc-300" />
              <span>Workflows customized with correct app name and cluster details</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input type="checkbox" className="rounded border-zinc-300" />
              <span>All GitHub secrets and variables configured</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input type="checkbox" className="rounded border-zinc-300" />
              <span>Kubernetes manifests customized and tested</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input type="checkbox" className="rounded border-zinc-300" />
              <span>Registry secret created in cluster</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input type="checkbox" className="rounded border-zinc-300" />
              <span>Build workflow tested with staging tag</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input type="checkbox" className="rounded border-zinc-300" />
              <span>Release workflow tested manually</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input type="checkbox" className="rounded border-zinc-300" />
              <span>Application accessible via ingress URL</span>
            </label>
          </div>
        </TipCard>
      </div>
    </main>
  );
};

export default DeployPage;
