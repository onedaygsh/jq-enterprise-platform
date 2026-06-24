"""
Tiangong-OS Service Client
Connects enterprise platform to live Supabase data
"""
import os
import json
import urllib.request
import urllib.error
from typing import Optional, Dict, Any, List


class TiangongService:
    """Async-compatible service for Tiangong-OS API"""

    def __init__(self):
        self.api_key = os.environ.get(
            "TIANGONG_API_KEY", ""
        )
        self.gateway_url = os.environ.get(
            "TIANGONG_GATEWAY_URL",
            "https://xkeymatouvbejdydsimv.supabase.co/functions/v1/public-api-gateway",
        )

    def _call(self, action: str, params: dict = None) -> dict:
        body = json.dumps({"action": action, "params": params or {}}).encode("utf-8")
        req = urllib.request.Request(
            self.gateway_url,
            data=body,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "X-Api-Version": "1.2.0",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            return {"error": f"HTTP {e.code}", "detail": e.read().decode("utf-8", errors="ignore")}
        except Exception as e:
            return {"error": str(e)}

    # ===== Dashboard =====
    def get_dashboard(self) -> dict:
        result = self._call("dashboard_stats")
        data = result.get("data", result)
        return {
            "products": data.get("total_products", 0),
            "orders": data.get("total_orders", 0),
            "suppliers": data.get("total_suppliers", 0),
            "after_sales": data.get("total_after_sales", 0),
            "unshipped_orders": data.get("unshipped_orders", 0),
            "timeout_orders": data.get("timeout_orders", 0),
            "from_tiangong": True,
        }

    # ===== Products =====
    def list_products(self, limit: int = 50, offset: int = 0, **filters) -> dict:
        return self._call("list_products", {"limit": limit, "offset": offset, **filters})

    def get_product(self, product_id: str) -> dict:
        return self._call("get_product", {"id": product_id})

    # ===== Orders =====
    def list_orders(self, limit: int = 50, offset: int = 0, status: str = None, **filters) -> dict:
        params = {"limit": limit, "offset": offset}
        if status:
            params["status"] = status
        params.update(filters)
        return self._call("list_orders", params)

    # ===== Suppliers =====
    def list_suppliers(self, limit: int = 50, **filters) -> dict:
        return self._call("list_suppliers", {"limit": limit, **filters})

    def get_supplier(self, supplier_id: str) -> dict:
        return self._call("get_supplier", {"id": supplier_id})

    def list_supplier_inventory(self, supplier_id: str = None, limit: int = 50) -> dict:
        params = {"limit": limit}
        if supplier_id:
            params["supplier_id"] = supplier_id
        return self._call("list_supplier_inventory", params)

    # ===== Logistics =====
    def list_logistics(self, limit: int = 50, **filters) -> dict:
        return self._call("list_logistics", {"limit": limit, **filters})

    # ===== After-Sales =====
    def list_after_sales(self, limit: int = 50, **filters) -> dict:
        return self._call("list_after_sales", {"limit": limit, **filters})

    # ===== QC =====
    def list_qc_reviews(self, limit: int = 50, **filters) -> dict:
        return self._call("list_qc_reviews", {"limit": limit, **filters})

    # ===== Finance (Amoeba) =====
    def list_amoeba_records(self, limit: int = 50, year: int = None, month: int = None, **filters) -> dict:
        params = {"limit": limit}
        if year:
            params["year"] = year
        if month:
            params["month"] = month
        params.update(filters)
        return self._call("list_amoeba_records", params)

    # ===== Organizations =====
    def list_organizations(self, limit: int = 50) -> dict:
        return self._call("list_organizations", {"limit": limit})


# Singleton instance
tiangong = TiangongService()