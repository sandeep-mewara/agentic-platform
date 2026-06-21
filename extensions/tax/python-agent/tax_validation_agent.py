#!/usr/bin/env python3
"""
Tax Validation Agent

Reads AgentRequest JSON from stdin containing a RequirementBrief.
Validates the brief against tax domain rules and returns AgentResponse JSON to stdout.

Contract:
- Input: JSON AgentRequest with requirementBrief in payload
- Output: JSON AgentResponse with validation result and recommendations
- Stdlib only: json, sys, re

Usage (from TypeScript):
  const response = await adapter.spawnPythonAgent(
    'extensions/tax/python-agent/tax_validation_agent.py',
    agentRequest
  )
"""

import json
import sys
from typing import Any, Dict, List


def validate_requirement_brief(brief: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validates a RequirementBrief against tax domain rules.

    Rules:
    1. Must explicitly mention tax, filing, or compliance if tax-related
    2. Must have explicit success criteria for accuracy/audit trails
    3. If multi-currency, must document currency handling rules
    4. If involves reporting deadlines, must specify regulatory framework
    5. Must identify tax-specific risks (audit, penalty, calculation errors)
    """
    issues: List[str] = []
    recommendations: List[str] = []

    feature_request = brief.get("featureRequest", "").lower()
    objectives = [obj.lower() for obj in brief.get("objectives", [])]
    risks = brief.get("risks", [])
    success_criteria = brief.get("successCriteria", [])
    constraints = brief.get("constraints", [])

    # Check 1: Tax keywords present if domain-relevant
    tax_keywords = ["tax", "filing", "irs", "compliance", "deduction", "refund", "audit"]
    has_tax_keyword = any(kw in feature_request for kw in tax_keywords) or any(
        kw in obj for kw in tax_keywords for obj in objectives
    )

    if has_tax_keyword and not any(kw in feature_request for kw in tax_keywords):
        issues.append("Tax domain detected in objectives but not explicitly stated in feature request")

    # Check 2: Accuracy/audit requirements explicit
    if has_tax_keyword:
        accuracy_mentioned = any(
            word in " ".join(success_criteria).lower()
            for word in ["accuracy", "audit", "trail", "correct", "precision"]
        )
        if not accuracy_mentioned:
            issues.append("Tax features require explicit accuracy/audit trail success criteria")
            recommendations.append(
                "Add success criteria: 'Audit trail captures all calculation steps and data sources'"
            )

    # Check 3: Multi-currency handling documented
    if any(term in feature_request for term in ["currency", "multi-currency", "forex", "exchange"]):
        currency_rules = any(
            term in " ".join(constraints).lower()
            for term in ["currency", "exchange rate", "conversion"]
        )
        if not currency_rules:
            issues.append("Multi-currency feature requires explicit currency handling rules in constraints")
            recommendations.append(
                "Document: 'Exchange rates updated daily from [source]; rounding rules per [standard]'"
            )

    # Check 4: Deadline/regulatory framework specified
    if any(term in feature_request for term in ["deadline", "filing", "quarter", "annual", "return"]):
        regulatory_mentioned = any(
            term in " ".join(constraints).lower()
            for term in ["irs", "regulatory", "framework", "standard", "requirement"]
        )
        if not regulatory_mentioned:
            issues.append("Deadline-based features require explicit regulatory framework in constraints")
            recommendations.append("Specify: 'Complies with IRS e-file requirements as of [tax year]'")

    # Check 5: Tax-specific risks identified
    if has_tax_keyword:
        tax_risk_categories = ["audit", "penalty", "calculation", "compliance", "deadline"]
        risk_categories = [risk.get("category", "").lower() for risk in risks]
        has_tax_risk = any(cat in str(risk_categories).lower() for cat in tax_risk_categories)

        if not has_tax_risk:
            issues.append("Tax features must explicitly document audit, penalty, and calculation risks")
            recommendations.append(
                "Add HIGH-severity risk: 'Calculation error could trigger IRS audit and penalties'"
            )

    # Generate status
    status = "APPROVED" if not issues else "APPROVED_WITH_CONDITIONS"
    if issues:
        recommendations.insert(
            0, f"Address {len(issues)} tax domain issue(s) before deployment to production"
        )

    return {
        "status": status,
        "issues": issues,
        "recommendations": recommendations,
        "tax_domain_detected": has_tax_keyword,
    }


def main() -> None:
    """Read AgentRequest from stdin, validate, write AgentResponse to stdout."""
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        agent_request = json.loads(input_data)

        # Extract RequirementBrief from payload
        brief = agent_request.get("payload", {})

        # Validate
        validation_result = validate_requirement_brief(brief)

        # Construct AgentResponse
        agent_response = {
            "agentId": "tax-validation-agent",
            "status": "SUCCESS" if validation_result["status"] == "APPROVED" else "SUCCESS",
            "output": json.dumps(validation_result),
            "metadata": {
                "validator": "tax_domain_rules",
                "rules_applied": 5,
                "tax_domain_relevant": validation_result["tax_domain_detected"],
            },
        }

        # Write response to stdout
        print(json.dumps(agent_response), flush=True)

    except json.JSONDecodeError as e:
        # Return error response
        error_response = {
            "agentId": "tax-validation-agent",
            "status": "ERROR",
            "output": "",
            "error": {"message": f"Invalid JSON input: {str(e)}", "code": "JSON_PARSE_ERROR"},
        }
        print(json.dumps(error_response), flush=True)
        sys.exit(1)

    except Exception as e:
        # Return generic error response
        error_response = {
            "agentId": "tax-validation-agent",
            "status": "ERROR",
            "output": "",
            "error": {"message": str(e), "code": "RUNTIME_ERROR"},
        }
        print(json.dumps(error_response), flush=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
