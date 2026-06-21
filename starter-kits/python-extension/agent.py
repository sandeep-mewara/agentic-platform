#!/usr/bin/env python3
"""
Python Agent for Agentic Platform.

This is a minimal example of a Python agent that integrates with the
TypeScript agentic platform via JSON stdin/stdout contract.

The agent follows the AgentRequest/AgentResponse schema defined in the platform.
See: contracts/agent/AgentRequestSchema.ts
"""

import json
import sys
from typing import Any, Dict, List, Optional
from datetime import datetime


class AgentRequest:
    """Represents an incoming request from the platform."""

    def __init__(self, data: Dict[str, Any]):
        self.id = data.get("id", "")
        self.skillId = data.get("skillId", "")
        self.input = data.get("input", {})
        self.metadata = data.get("metadata", {})
        self.timestamp = data.get("timestamp", "")

    def __repr__(self):
        return f"AgentRequest(id={self.id}, skillId={self.skillId})"


class AgentResponse:
    """Represents the response from this agent to the platform."""

    def __init__(
        self,
        agent_request: AgentRequest,
        status: str = "success",
        output: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None,
    ):
        self.id = agent_request.id
        self.skillId = agent_request.skillId
        self.timestamp = datetime.now().isoformat()
        self.status = status  # "success", "error", "partial"
        self.output = output or {}
        self.error = error

    def to_dict(self) -> Dict[str, Any]:
        """Convert to JSON-serializable dict."""
        return {
            "id": self.id,
            "skillId": self.skillId,
            "timestamp": self.timestamp,
            "status": self.status,
            "output": self.output,
            "error": self.error,
        }


def process_request(request: AgentRequest) -> AgentResponse:
    """
    Process the incoming request and generate response.

    This is where you implement your agent's business logic.
    For this example, we do some minimal processing.
    """

    try:
        # Extract input data
        input_data = request.input
        skill_id = request.skillId

        # Example processing based on skill type
        if skill_id == "code-analysis":
            output = analyze_code(input_data)
        elif skill_id == "data-validation":
            output = validate_data(input_data)
        elif skill_id == "custom-logic":
            output = custom_domain_logic(input_data)
        else:
            # Default: echo input
            output = {"processed": True, "input": input_data}

        # Return success response
        return AgentResponse(
            request,
            status="success",
            output=output,
        )

    except Exception as e:
        # Return error response
        return AgentResponse(
            request,
            status="error",
            error=str(e),
        )


def analyze_code(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Example: Analyze code and return insights."""
    code = input_data.get("code", "")

    # Minimal analysis
    lines = code.split("\n")
    functions = [line for line in lines if line.strip().startswith("def ")]
    classes = [line for line in lines if line.strip().startswith("class ")]

    return {
        "codeLength": len(code),
        "lineCount": len(lines),
        "functionCount": len(functions),
        "classCount": len(classes),
        "hasDocstring": '"""' in code or "'''" in code,
    }


def validate_data(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Example: Validate data structure."""
    data = input_data.get("data", {})

    # Minimal validation
    required_fields = input_data.get("requiredFields", [])
    missing_fields = [f for f in required_fields if f not in data]

    return {
        "isValid": len(missing_fields) == 0,
        "missingFields": missing_fields,
        "fieldCount": len(data),
    }


def custom_domain_logic(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Example: Custom domain-specific processing."""
    # This is where you'd implement your team's specialized logic
    # Example: tax calculation, compliance checks, financial analysis, etc.

    return {
        "processed": True,
        "customLogicApplied": True,
        "metadata": input_data.get("metadata", {}),
    }


def main():
    """Main entry point. Read JSON from stdin, process, write to stdout."""

    try:
        # Read input from stdin
        input_line = sys.stdin.read()

        if not input_line.strip():
            # No input provided
            response = AgentResponse(
                AgentRequest({"id": "unknown"}),
                status="error",
                error="No input provided",
            )
            print(json.dumps(response.to_dict()))
            sys.exit(1)

        # Parse JSON input
        request_data = json.loads(input_line)
        request = AgentRequest(request_data)

        # Process the request
        response = process_request(request)

        # Write JSON response to stdout
        print(json.dumps(response.to_dict()))

    except json.JSONDecodeError as e:
        # Invalid JSON input
        response = AgentResponse(
            AgentRequest({"id": "unknown"}),
            status="error",
            error=f"Invalid JSON: {str(e)}",
        )
        print(json.dumps(response.to_dict()))
        sys.exit(1)

    except Exception as e:
        # Unexpected error
        response = AgentResponse(
            AgentRequest({"id": "unknown"}),
            status="error",
            error=f"Unexpected error: {str(e)}",
        )
        print(json.dumps(response.to_dict()))
        sys.exit(1)


if __name__ == "__main__":
    main()
