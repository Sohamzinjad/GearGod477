import asyncio
from app.database import engine
from sqlalchemy import text
from app.models import User

async def fix_db_users():
    async with engine.begin() as conn:
        print("Starting Database Normalization...")

        # 1. Fetch Users to build Name -> ID map
        result = await conn.execute(text("SELECT id, name FROM users"))
        users = result.fetchall()
        name_to_id = {u.name: u.id for u in users}
        print(f"Found users: {name_to_id}")

        # 2. Update Equipments: default_technician_id (String -> ID String)
        # We fetch all distinct values first to minimize updates
        erp_techs = await conn.execute(text("SELECT DISTINCT default_technician_id FROM equipments WHERE default_technician_id IS NOT NULL"))
        for row in erp_techs:
            tech_name = row[0]
            # Check if it's already a number (if script partially ran)
            if tech_name.isdigit():
                continue
                
            if tech_name in name_to_id:
                user_id = name_to_id[tech_name]
                print(f"Updating Equipment technician '{tech_name}' to ID '{user_id}'")
                await conn.execute(text("UPDATE equipments SET default_technician_id = :uid WHERE default_technician_id = :name"), {"uid": str(user_id), "name": tech_name})
            else:
                print(f"Warning: Equipment technician '{tech_name}' not found in Users. Setting to NULL.")
                await conn.execute(text("UPDATE equipments SET default_technician_id = NULL WHERE default_technician_id = :name"), {"name": tech_name})

        # 3. Update Equipments: employee_id
        erp_emps = await conn.execute(text("SELECT DISTINCT employee_id FROM equipments WHERE employee_id IS NOT NULL"))
        for row in erp_emps:
            emp_name = row[0]
            if emp_name.isdigit():
                continue

            if emp_name in name_to_id:
                user_id = name_to_id[emp_name]
                print(f"Updating Equipment employee '{emp_name}' to ID '{user_id}'")
                await conn.execute(text("UPDATE equipments SET employee_id = :uid WHERE employee_id = :name"), {"uid": str(user_id), "name": emp_name})
            else:
                print(f"Warning: Equipment employee '{emp_name}' not found in Users. Setting to NULL.")
                await conn.execute(text("UPDATE equipments SET employee_id = NULL WHERE employee_id = :name"), {"name": emp_name})

        # 4. Update Requests: technician_id
        req_techs = await conn.execute(text("SELECT DISTINCT technician_id FROM maintenance_requests WHERE technician_id IS NOT NULL"))
        for row in req_techs:
            tech_name = row[0]
            if tech_name.isdigit():
                continue

            if tech_name in name_to_id:
                user_id = name_to_id[tech_name]
                print(f"Updating Request technician '{tech_name}' to ID '{user_id}'")
                await conn.execute(text("UPDATE maintenance_requests SET technician_id = :uid WHERE technician_id = :name"), {"uid": str(user_id), "name": tech_name})
            else:
                print(f"Warning: Request technician '{tech_name}' not found in Users. Setting to NULL.")
                await conn.execute(text("UPDATE maintenance_requests SET technician_id = NULL WHERE technician_id = :name"), {"name": tech_name})

        # 5. ALTER COLUMNS to INTEGER and Add Foreign Keys
        print("Altering columns to INTEGER...")
        await conn.execute(text("ALTER TABLE equipments ALTER COLUMN default_technician_id TYPE INTEGER USING default_technician_id::integer"))
        await conn.execute(text("ALTER TABLE equipments ALTER COLUMN employee_id TYPE INTEGER USING employee_id::integer"))
        await conn.execute(text("ALTER TABLE maintenance_requests ALTER COLUMN technician_id TYPE INTEGER USING technician_id::integer"))

        print("Adding Foreign Key Constraint...")
        # Note: We must ensure no IDs point to non-existent users, but we just updated them from existing users, so safe.
        await conn.execute(text("ALTER TABLE equipments ADD CONSTRAINT fk_equipment_technician FOREIGN KEY (default_technician_id) REFERENCES users(id)"))
        await conn.execute(text("ALTER TABLE equipments ADD CONSTRAINT fk_equipment_employee FOREIGN KEY (employee_id) REFERENCES users(id)"))
        await conn.execute(text("ALTER TABLE maintenance_requests ADD CONSTRAINT fk_request_technician FOREIGN KEY (technician_id) REFERENCES users(id)"))

        print("Database Normalization Complete.")

if __name__ == "__main__":
    asyncio.run(fix_db_users())
