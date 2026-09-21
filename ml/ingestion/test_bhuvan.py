import requests

URL = "https://bhuvan-app1.nrsc.gov.in/lightning/"

response = requests.get(
    URL,
    timeout=30,
    headers={
        "User-Agent": "Mozilla/5.0"
    }
)

print("STATUS:", response.status_code)
print("CONTENT TYPE:", response.headers.get("Content-Type"))
print("SIZE:", len(response.content))

print("\nFIRST 1000 CHARACTERS:")
print(response.text[:1000])