#!/usr/bin/env python3
"""
Risk Scoring Module
Calculates overall security risk score (0-10 scale)
"""

from typing import Dict, List, Any

class RiskScorer:
    """Calculate device risk score based on vulnerabilities"""
    
    SEVERITY_WEIGHTS = {
        "CRITICAL": 10,
        "HIGH": 6,
        "MEDIUM": 3,
        "LOW": 1
    }
    
    @staticmethod
    def calculate_overall_risk(vulnerabilities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate overall risk score (0-10)
        
        Formula:
        - Average of all vulnerability weights
        - CRITICAL: 10 points
        - HIGH: 6 points
        - MEDIUM: 3 points
        - LOW: 1 point
        - Max: 10
        """
        if not vulnerabilities:
            return {
                "score": 0,
                "level": "MINIMAL",
                "description": "No vulnerabilities detected",
                "vulnerabilities_count": 0,
                "breakdown": {
                    "critical": 0,
                    "high": 0,
                    "medium": 0,
                    "low": 0
                }
            }
        
        # Calculate total risk
        total_risk = 0
        critical_count = 0
        high_count = 0
        medium_count = 0
        low_count = 0
        
        for vuln in vulnerabilities:
            severity = vuln.get("severity", "MEDIUM")
            weight = RiskScorer.SEVERITY_WEIGHTS.get(severity, 3)
            total_risk += weight
            
            if severity == "CRITICAL":
                critical_count += 1
            elif severity == "HIGH":
                high_count += 1
            elif severity == "MEDIUM":
                medium_count += 1
            elif severity == "LOW":
                low_count += 1
        
        # Normalize score: average of vulnerabilities, capped at 10
        avg_risk = total_risk / len(vulnerabilities) if vulnerabilities else 0
        normalized_score = min(avg_risk, 10)
        
        # Boost score if there are critical vulnerabilities
        if critical_count > 0:
            normalized_score = max(normalized_score, 9)
        
        risk_level = RiskScorer._get_risk_level(normalized_score)
        
        return {
            "score": round(normalized_score, 1),
            "level": risk_level,
            "description": RiskScorer._get_risk_description(risk_level, critical_count, high_count),
            "vulnerabilities_count": len(vulnerabilities),
            "breakdown": {
                "critical": critical_count,
                "high": high_count,
                "medium": medium_count,
                "low": low_count
            },
            "recommendations": RiskScorer._get_priority_recommendations(critical_count, high_count, medium_count)
        }
    
    @staticmethod
    def _get_risk_level(score: float) -> str:
        """Convert numeric score to risk level"""
        if score >= 9:
            return "CRITICAL"
        elif score >= 7:
            return "HIGH"
        elif score >= 4:
            return "MEDIUM"
        elif score >= 2:
            return "LOW"
        else:
            return "MINIMAL"
    
    @staticmethod
    def _get_risk_description(level: str, critical: int, high: int) -> str:
        """Generate human-readable risk description"""
        if level == "CRITICAL":
            return f"🔴 CRITICAL RISK: {critical} critical issue(s) found. Immediate action required."
        elif level == "HIGH":
            return f"🟠 HIGH RISK: {high} high-severity vulnerabilities detected. Fix soon."
        elif level == "MEDIUM":
            return "🟡 MEDIUM RISK: Multiple moderate issues. Address within a week."
        elif level == "LOW":
            return "🟢 LOW RISK: Minor issues found. Consider fixing."
        else:
            return "✅ MINIMAL RISK: Device appears reasonably secure."
    
    @staticmethod
    def _get_priority_recommendations(critical: int, high: int, medium: int) -> List[str]:
        """Get prioritized recommendations based on vulnerability counts"""
        recommendations = []
        
        if critical > 0:
            recommendations.append(f"⚠️  URGENT: Fix {critical} critical vulnerability/vulnerabilities immediately")
        
        if high > 0:
            recommendations.append(f"🔴 Fix {high} high-severity issue(s) this week")
        
        if medium > 0:
            recommendations.append(f"🟡 Schedule fixes for {medium} medium-severity issue(s)")
        
        recommendations.extend([
            "✅ After fixes, run this scan again to verify improvements",
            "📋 Document all changes made",
            "🔄 Set up monthly security scans"
        ])
        
        return recommendations
    
    @staticmethod
    def calculate_device_security_score(nmap_results: Dict[str, Any], vulnerabilities: List[Dict]) -> Dict[str, Any]:
        """
        Calculate comprehensive device security score
        Based on:
        - Number and severity of vulnerabilities
        - Ports open
        - Services running
        """
        
        open_ports = nmap_results.get("open_ports", [])
        port_count = len(open_ports)
        
        # Base score: 100 (perfect security)
        base_score = 100
        
        # Deduct points for vulnerabilities
        for vuln in vulnerabilities:
            severity = vuln.get("severity", "MEDIUM")
            if severity == "CRITICAL":
                base_score -= 20  # Critical: -20 points
            elif severity == "HIGH":
                base_score -= 10  # High: -10 points
            elif severity == "MEDIUM":
                base_score -= 5   # Medium: -5 points
            elif severity == "LOW":
                base_score -= 2   # Low: -2 points
        
        # Deduct points for excessive open ports (optional, on top of vulns)
        if port_count > 5:
            base_score -= (port_count - 5) * 2
        
        # Ensure score stays 0-100
        final_score = max(0, min(base_score, 100))
        
        # Convert to 0-10 scale for display
        display_score = (final_score / 10)
        
        return {
            "security_score": round(display_score, 1),
            "out_of": 10,
            "detailed_score": final_score,
            "grade": RiskScorer._get_security_grade(final_score),
            "interpretation": RiskScorer._get_score_interpretation(final_score)
        }
    
    @staticmethod
    def _get_security_grade(score: float) -> str:
        """Convert score to letter grade"""
        if score >= 90:
            return "A"
        elif score >= 80:
            return "B"
        elif score >= 70:
            return "C"
        elif score >= 60:
            return "D"
        else:
            return "F"
    
    @staticmethod
    def _get_score_interpretation(score: float) -> str:
        """Interpret security score"""
        if score >= 85:
            return "Excellent - Device is well-secured"
        elif score >= 70:
            return "Good - Minor issues need attention"
        elif score >= 55:
            return "Fair - Multiple issues should be addressed"
        elif score >= 40:
            return "Poor - Significant security gaps"
        else:
            return "Critical - Serious security vulnerabilities present"
