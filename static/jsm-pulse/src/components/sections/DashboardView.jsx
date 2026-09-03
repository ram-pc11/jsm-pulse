import { useEffect, useState } from 'react'
import PageHead from '../layout/PageHead.jsx'
import LoadingState from '../shared/LoadingState.jsx'
import ScoreCard from '../dashboard/ScoreCard.jsx'
import MetricsRow from '../dashboard/MetricsRow.jsx'
import Callouts from '../dashboard/Callouts.jsx'
import AIInsightsPanel from '../dashboard/AIInsightsPanel.jsx'
import RecommendationsPanel from '../dashboard/RecommendationsPanel.jsx'
import GradeSeverityDistribution from '../dashboard/GradeSeverityDistribution.jsx'
import SlaTicketMetrics from '../dashboard/SlaTicketMetrics.jsx'
import AgentWorkload from '../dashboard/AgentWorkload.jsx'
import AtRiskQueues from '../dashboard/AtRiskQueues.jsx'
import FindingBreakdown from '../dashboard/FindingBreakdown.jsx'
import SlaRatios from '../dashboard/SlaRatios.jsx'
import QueueSources from '../dashboard/QueueSources.jsx'
import {
  fetchDashboardSummary,
  fetchGradeSeverityDistribution,
  fetchAiInsights,
  fetchRecommendations,
} from '../../services/dashboardService.js'
import { fetchAllServiceDesks } from '../../services/serviceRequestService.js'

const DashboardView = () => {
  const [summary, setSummary] = useState(null)
  const [distribution, setDistribution] = useState(null)
  const [insights, setInsights] = useState(null)
  const [recommendations, setRecommendations] = useState(null)
  const [serviceDeskId, setServiceDeskId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    Promise.all([
      fetchDashboardSummary(),
      fetchGradeSeverityDistribution(),
      fetchAiInsights(),
      fetchRecommendations(),
      fetchAllServiceDesks().then((desks) => desks[0]?.id ?? null),
    ])
      .then(([summaryResult, distributionResult, insightsResult, recommendationsResult, deskId]) => {
        if (cancelled) return
        setSummary(summaryResult)
        setDistribution(distributionResult.distribution)
        setInsights(insightsResult.insights)
        setRecommendations(recommendationsResult.recommendations)
        setServiceDeskId(deskId)
      })
      .catch((err) => !cancelled && setError(err))

    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return <p className="text-sm text-red-600">Failed to load dashboard: {error.message}</p>
  }

  if (!summary || !distribution || !insights || !recommendations) {
    return <LoadingState label="Loading dashboard..." />
  }

  return (
    <div>
      <PageHead title="Dashboard" description="Composite JSM health score and AI-driven insights." />

      <div className="flex flex-col gap-6">
        <Callouts insights={insights} />
        <ScoreCard score={summary.score} grade={summary.grade} severity={summary.severity} />
        <MetricsRow metrics={summary.metrics} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AIInsightsPanel insights={insights} />
          <RecommendationsPanel recommendations={recommendations} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <GradeSeverityDistribution distribution={distribution} />
          <SlaRatios metrics={summary.metrics} />
        </div>

        <SlaTicketMetrics metrics={summary.metrics} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <AtRiskQueues serviceDeskId={serviceDeskId} />
          <QueueSources serviceDeskId={serviceDeskId} />
          <AgentWorkload />
        </div>

        <FindingBreakdown insights={insights} />
      </div>
    </div>
  )
}

export default DashboardView
