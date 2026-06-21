#!/usr/bin/env python3
"""
ML Risk Scoring Agent for Agentic Platform.

Evaluates architectural decisions for risk factors using ML model.
Integrates with TypeScript orchestrator via JSON stdin/stdout.
"""

import json
import sys
from datetime import datetime
from typing import Any, Dict, Optional


class RiskScorer:
    """Scores architecture for risk factors."""

    # Risk weights (configurable)
    RISK_WEIGHTS = {
        'missing_error_handling': 0.25,
        'synchronous_io': 0.20,
        'missing_rate_limit': 0.20,
        'no_caching': 0.15,
        'missing_auth': 0.20
    }

    def score_architecture(self, architecture_text: str) -> Dict[str, Any]:
        """Score architecture for risk factors."""
        text = architecture_text.lower()
        risk_factors = []
        total_risk = 0.0

        # Check for risk factors
        if 'error' not in text or 'exception' not in text:
            risk_factors.append('missing_error_handling')
            total_risk += self.RISK_WEIGHTS['missing_error_handling']

        if 'sync' in text and 'async' not in text:
            risk_factors.append('synchronous_io')
            total_risk += self.RISK_WEIGHTS['synchronous_io']

        if 'rate' not in text and 'limit' not in text:
            risk_factors.append('missing_rate_limit')
            total_risk += self.RISK_WEIGHTS['missing_rate_limit']

        if 'cache' not in text:
            risk_factors.append('no_caching')
            total_risk += self.RISK_WEIGHTS['no_caching']

        if 'auth' not in text and 'token' not in text:
            risk_factors.append('missing_auth')
            total_risk += self.RISK_WEIGHTS['missing_auth']

        # Normalize risk to 0-1
        total_risk = min(1.0, total_risk)

        return {
            'riskScore': round(total_risk, 2),
            'riskLevel': 'HIGH' if total_risk > 0.7 else 'MEDIUM' if total_risk > 0.4 else 'LOW',
            'riskFactors': risk_factors,
            'recommendations': self._get_recommendations(risk_factors)
        }

    def _get_recommendations(self, risk_factors: list) -> list:
        """Generate recommendations for risk factors."""
        recommendations = []

        for factor in risk_factors:
            if factor == 'missing_error_handling':
                recommendations.append('Add comprehensive error handling and graceful degradation')
            elif factor == 'synchronous_io':
                recommendations.append('Use async/await for I/O operations')
            elif factor == 'missing_rate_limit':
                recommendations.append('Implement rate limiting and request throttling')
            elif factor == 'no_caching':
                recommendations.append('Add caching layer to reduce load')
            elif factor == 'missing_auth':
                recommendations.append('Implement authentication and authorization')

        return recommendations


class AgentResponse:
    """Response from ML agent."""

    def __init__(self, request_id: str, skill_id: str, output: Dict[str, Any]):
        self.id = request_id
        self.skillId = skill_id
        self.timestamp = datetime.now().isoformat()
        self.status = 'success'
        self.output = output
        self.error = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'skillId': self.skillId,
            'timestamp': self.timestamp,
            'status': self.status,
            'output': self.output,
            'error': self.error
        }


def main():
    """Main entry point."""
    try:
        # Read request
        request_data = json.loads(sys.stdin.read())
        request_id = request_data.get('id', 'unknown')
        skill_id = request_data.get('skillId', 'risk-assessment')

        # Score architecture
        scorer = RiskScorer()
        architecture = json.dumps(request_data.get('input', {}))
        output = scorer.score_architecture(architecture)

        # Return response
        response = AgentResponse(request_id, skill_id, output)
        print(json.dumps(response.to_dict()))

    except Exception as e:
        response_data = {
            'id': 'unknown',
            'skillId': 'risk-assessment',
            'timestamp': datetime.now().isoformat(),
            'status': 'error',
            'output': {},
            'error': str(e)
        }
        print(json.dumps(response_data))
        sys.exit(1)


if __name__ == '__main__':
    main()
