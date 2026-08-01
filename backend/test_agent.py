import asyncio

from app.agents.agent import create_agent


async def main():

    try:
        agent = await create_agent()

        print("✅ Agent Created Successfully")
        print(f"Agent Name: {agent.name}")
        print(type(agent))

    except Exception as e:
        print("❌ Agent Creation Failed")
        print(str(e))


if __name__ == "__main__":
    asyncio.run(main())