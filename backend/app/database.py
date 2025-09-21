from typing import Dict, List, Optional
from datetime import datetime
import json
from .models import *

class InMemoryDatabase:
    def __init__(self):
        self.users: Dict[int, dict] = {}
        self.user_profiles: Dict[int, dict] = {}
        self.next_of_kin: Dict[int, dict] = {}
        self.medical_info: Dict[int, dict] = {}
        self.certificates: Dict[int, dict] = {}
        self.electronic_signatures: Dict[int, dict] = {}
        self.vessels: Dict[int, dict] = {}
        self.crew_assignments: Dict[int, dict] = {}
        self.maintenance_records: Dict[int, dict] = {}
        self.safety_records: Dict[int, dict] = {}
        self.qhse_records: Dict[int, dict] = {}
        
        self._next_id = 1
        
        self._seed_data()
    
    def _get_next_id(self) -> int:
        current_id = self._next_id
        self._next_id += 1
        return current_id
    
    def _seed_data(self):
        demo_vessel = {
            "id": self._get_next_id(),
            "name": "MV Ocean Explorer",
            "imo_number": "IMO1234567",
            "vessel_type": "Container Ship",
            "flag_state": "Panama",
            "gross_tonnage": 50000.0,
            "length": 200.0,
            "beam": 32.0,
            "year_built": 2015,
            "is_active": True,
            "created_at": datetime.now()
        }
        self.vessels[demo_vessel["id"]] = demo_vessel
        
        demo_maintenance = {
            "id": self._get_next_id(),
            "vessel_id": demo_vessel["id"],
            "title": "Engine Oil Change",
            "description": "Routine engine oil change for main engine",
            "maintenance_type": "Routine",
            "scheduled_date": datetime.now().date(),
            "completed_date": None,
            "status": "pending",
            "assigned_to": None,
            "cost": 2500.0,
            "created_by": 1,
            "created_at": datetime.now()
        }
        self.maintenance_records[demo_maintenance["id"]] = demo_maintenance
    
    def create_user(self, user_data: dict) -> dict:
        user_id = self._get_next_id()
        user_data["id"] = user_id
        user_data["created_at"] = datetime.now()
        self.users[user_id] = user_data
        return user_data
    
    def get_user_by_email(self, email: str) -> Optional[dict]:
        for user in self.users.values():
            if user["email"] == email:
                return user
        return None
    
    def get_user_by_id(self, user_id: int) -> Optional[dict]:
        return self.users.get(user_id)
    
    def update_user_profile(self, user_id: int, profile_data: dict) -> dict:
        self.user_profiles[user_id] = profile_data
        return profile_data
    
    def get_user_profile(self, user_id: int) -> Optional[dict]:
        return self.user_profiles.get(user_id)
    
    def create_certificate(self, cert_data: dict) -> dict:
        cert_id = self._get_next_id()
        cert_data["id"] = cert_id
        cert_data["created_at"] = datetime.now()
        self.certificates[cert_id] = cert_data
        return cert_data
    
    def get_user_certificates(self, user_id: int) -> List[dict]:
        return [cert for cert in self.certificates.values() if cert["user_id"] == user_id]
    
    def get_vessels(self) -> List[dict]:
        return list(self.vessels.values())
    
    def get_vessel_by_id(self, vessel_id: int) -> Optional[dict]:
        return self.vessels.get(vessel_id)
    
    def create_maintenance_record(self, maintenance_data: dict) -> dict:
        maintenance_id = self._get_next_id()
        maintenance_data["id"] = maintenance_id
        maintenance_data["created_at"] = datetime.now()
        self.maintenance_records[maintenance_id] = maintenance_data
        return maintenance_data
    
    def get_maintenance_records(self, vessel_id: Optional[int] = None) -> List[dict]:
        if vessel_id:
            return [record for record in self.maintenance_records.values() if record["vessel_id"] == vessel_id]
        return list(self.maintenance_records.values())
    
    def create_safety_record(self, safety_data: dict) -> dict:
        safety_id = self._get_next_id()
        safety_data["id"] = safety_id
        safety_data["created_at"] = datetime.now()
        self.safety_records[safety_id] = safety_data
        return safety_data
    
    def get_safety_records(self, vessel_id: Optional[int] = None) -> List[dict]:
        if vessel_id:
            return [record for record in self.safety_records.values() if record["vessel_id"] == vessel_id]
        return list(self.safety_records.values())
    
    def create_vessel(self, vessel_data: dict) -> dict:
        vessel_id = self._get_next_id()
        vessel_data["id"] = vessel_id
        vessel_data["created_at"] = datetime.now()
        self.vessels[vessel_id] = vessel_data
        return vessel_data
    
    def create_crew_assignment(self, assignment_data: dict) -> dict:
        assignment_id = self._get_next_id()
        assignment_data["id"] = assignment_id
        self.crew_assignments[assignment_id] = assignment_data
        return assignment_data
    
    def get_crew_assignments(self, user_id: Optional[int] = None, vessel_id: Optional[int] = None) -> List[dict]:
        assignments = list(self.crew_assignments.values())
        if user_id:
            assignments = [a for a in assignments if a["user_id"] == user_id]
        if vessel_id:
            assignments = [a for a in assignments if a["vessel_id"] == vessel_id]
        return assignments
    
    def get_user_current_assignment(self, user_id: int) -> Optional[dict]:
        for assignment in self.crew_assignments.values():
            if assignment["user_id"] == user_id and assignment["is_active"]:
                return assignment
        return None
    
    def update_crew_assignment(self, assignment_id: int, assignment_data: dict) -> Optional[dict]:
        if assignment_id in self.crew_assignments:
            self.crew_assignments[assignment_id].update(assignment_data)
            return self.crew_assignments[assignment_id]
        return None
    
    def get_user_next_of_kin(self, user_id: int) -> Optional[dict]:
        for kin in self.next_of_kin.values():
            if kin["user_id"] == user_id:
                return kin
        return None
    
    def update_user_next_of_kin(self, user_id: int, kin_data: dict) -> dict:
        existing_kin = self.get_user_next_of_kin(user_id)
        if existing_kin:
            existing_kin.update(kin_data)
            return existing_kin
        else:
            kin_id = self._get_next_id()
            kin_data["id"] = kin_id
            kin_data["user_id"] = user_id
            self.next_of_kin[kin_id] = kin_data
            return kin_data
    
    def get_user_medical_info(self, user_id: int) -> Optional[dict]:
        for medical in self.medical_info.values():
            if medical["user_id"] == user_id:
                return medical
        return None
    
    def update_user_medical_info(self, user_id: int, medical_data: dict) -> dict:
        existing_medical = self.get_user_medical_info(user_id)
        if existing_medical:
            existing_medical.update(medical_data)
            return existing_medical
        else:
            medical_id = self._get_next_id()
            medical_data["id"] = medical_id
            medical_data["user_id"] = user_id
            self.medical_info[medical_id] = medical_data
            return medical_data
    
    def get_user_electronic_signature(self, user_id: int) -> Optional[dict]:
        for signature in self.electronic_signatures.values():
            if signature["user_id"] == user_id and signature["is_active"]:
                return signature
        return None
    
    def update_user_electronic_signature(self, user_id: int, signature_data: dict) -> dict:
        existing_signature = self.get_user_electronic_signature(user_id)
        if existing_signature:
            existing_signature.update(signature_data)
            return existing_signature
        else:
            signature_id = self._get_next_id()
            signature_data["id"] = signature_id
            signature_data["user_id"] = user_id
            signature_data["created_at"] = datetime.now()
            self.electronic_signatures[signature_id] = signature_data
            return signature_data

db = InMemoryDatabase()
