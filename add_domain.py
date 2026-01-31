import requests
import google.auth.transport.requests
from google.oauth2 import service_account

SERVICE_ACCOUNT_INFO = {
    "type": "service_account",
    "project_id": "gravli2466",
    "private_key_id": "115372f5ec8890f1935e7594386899a04777ea03",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDBBm9qqrxgpWyq\n75I5UEboI570zMMwfpvi/WtiO6hQJdaN1agp0aunsK+wsILX0AqwOGoGMG7DJkjB\nKlm8j7tYgShB1/LOAlwxWmfiZ4wp0tK8P+oQSa1yX7ZK8KAsQhvk4bNVE+Ja3FMA\ndphX+dAimwtU44GwU4oMFoef9dzpvqUhC17kT5+0jTQyQyU7Ja3KqW2PJA19+R3Z\n9gCrtfSMT/041KmDFQhORTCu53ozlr70EGT5IznJCY2yorAVE8pDSuGkELYwL0zu\n6nCtexqRcRvQ0/1QiZxXyXWMZ3gwtQK8YlReCgJKXCOhuaMn7Dp/ztInY7zg9+9y\n48OAXrnTAgMBAAECggEANJnv1+YiQsYh2G1D8Fl3kUBPy49Xa8o86f08e78dLYY6\nM1mzo33PZPnJzwEzDuPTXdVp0zj0njq7HeTQIooauFIuKc9TDB/phsuHvtOQBz+8\nDO/v9bNWUHJTx5VOWPFFD7kP+VHbX/5loh0vg94AgcW1r1L2XxpM5uFm4UkLhCjl\nV+XP57bm0Gz5xozmff3kdYzhfy83skhGkL4HrpJv1kMt7ysup7sK70+dtpm+stiY\n+C4G3znQxdDSPe1uN748a2qb5F/j4vrh+ZMMGAHR5UvbgFJts9hELz8CAZgodKHi\nhavRpP1fOI4GDMydUjeSlRAmuuPpGkRhFKTsFhcKSQKBgQD7u6CQophf1Wny8w6s\nbwIjeTrgDSEVEfI+RX/k3BsatIMEWtZ1ManUDowd2HyHkZvPDxjoi5KClOr1KQl2\n/Pfn+gbagTUbB0Iu9vtPwRxD/rLZ64eHz7X8uDIzVpLZ+OJF4i4RqwvjgrOxLh9l\nuIXkHVPb/0n6IlfaHwO36GL0GQKBgQDETAz/uwGzUFgm6i3/2Qbfb1Ic+/LjpQqJ\ntDtGfxh9nyNA5ByquBHUHLYOT+K2TmwmiDQgMQluK1/WMwLI07M2xOz48D9J9YGE\ny3n+uoDaunsa4gKPJJ2kD0PfnmrAtXxFq62LSF4/uIKwhVMDFzBuAzSQAt2i65z5\nmRSIkpW6ywKBgCRk7QLcLxFz5lx0nYN6jSGZzlREMas9K/uqyqHI3LZQsLx5cZYB\n9x6sd7985AwplhAqi5xbSXRNmWaWZ0LnseO89y6yDX553yyxEoZmUfLWqP7umWqe\nMh52dvOLKbIP1I7r82MkipR6+gW8uFdZhSoEv3IIB6b9PhxP7ZayJ1RJAoGAfTMk\nd1eHVh9AmlFy1WRPBeOys9neqWNyvTG/PM+Dh1wg2BqmThzpAijt1WMObsjGIi1t\nUbr1ENeJYM1YUU71V1Fy87QIKdv0qAY/4UCDPv8B1buhdjsccK9r0wzvecpHYQiG\nv/eAZZQBhyUCNU5tDT3uIIwzYN52WJxShGk6JtECgYB41tnNzClDTEk158RKbl3X\nnEsbrXxpVWZWXRW0DfP6i0sYfVh0FGJS2Tr/nAYnudCSh+0j/SoEvt5x3gTyv/2k\npKFXpkwv3CgBX4KMat4xEePb+/MeI8kZm9MCV7xg+utYMu/GyJn9UjCBbVehaCcE\nw/36Kgdecooqp4Ks/oTMVA==\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-fbsvc@gravli2466.iam.gserviceaccount.com",
    "client_id": "102921227125836147687",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token"
}

PROJECT_ID = "gravli2466"

def get_access_token():
    credentials = service_account.Credentials.from_service_account_info(
        SERVICE_ACCOUNT_INFO,
        scopes=['https://www.googleapis.com/auth/firebase', 'https://www.googleapis.com/auth/identitytoolkit', 'https://www.googleapis.com/auth/cloud-platform']
    )
    request = google.auth.transport.requests.Request()
    credentials.refresh(request)
    return credentials.token

def get_current_config(access_token):
    url = f"https://identitytoolkit.googleapis.com/admin/v2/projects/{PROJECT_ID}/config"
    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    return None

def add_domains(access_token, domains):
    url = f"https://identitytoolkit.googleapis.com/admin/v2/projects/{PROJECT_ID}/config"
    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    
    current = get_current_config(access_token)
    if current:
        authorized_domains = current.get("authorizedDomains", [])
        print(f"Current domains: {authorized_domains}")
        
        for domain in domains:
            if domain not in authorized_domains:
                authorized_domains.append(domain)
                print(f"Adding: {domain}")
        
        data = {"authorizedDomains": authorized_domains}
        response = requests.patch(url, headers=headers, json=data, params={"updateMask": "authorizedDomains"})
        
        if response.status_code == 200:
            print(f"✅ Domains updated successfully!")
            print(f"New domains: {response.json().get('authorizedDomains', [])}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")

access_token = get_access_token()
# Only add valid domain names (no ports)
domains_to_add = [
    "app.emergent.sh",
    "emergent.sh"
]
add_domains(access_token, domains_to_add)
