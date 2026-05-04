#!/usr/bin/env python3
"""
fix_donate_revert.py — Revert donate route to correct AbacatePay v2 format.
Per official docs: POST /transparents/create with data.amount wrapper.

Run from the pronto.ia repo root.
"""

import os
import sys

def main():
    path = 'apps/web/src/app/api/v1/donate/route.ts'

    if not os.path.isfile(path):
        print("ERROR: Run from repo root. File not found:", path)
        sys.exit(1)

    with open(path, 'r') as f:
        content = f.read()

    # Replace the flat format back to the correct data wrapper format
    old_body = """        body: JSON.stringify({
          amount,
          expiresIn: 3600,
          description: 'Doação para o projeto Pronto.IA',
          metadata: {
            source: 'pronto-ia-web',
            kind: 'donation',
          },
        }),"""

    new_body = """        body: JSON.stringify({
          data: {
            amount,
            expiresIn: 3600,
            description: 'Doação para o projeto Pronto.IA',
            metadata: {
              source: 'pronto-ia-web',
              kind: 'donation',
            },
          },
        }),"""

    if old_body in content:
        content = content.replace(old_body, new_body)
        print("[OK] Reverted to data wrapper format (per AbacatePay v2 docs)")
    else:
        print("[INFO] data wrapper format already in place, checking...")

    with open(path, 'w') as f:
        f.write(content)

    print(f"\n[Done] {path}")
    print("Format: { data: { amount, expiresIn, description, metadata } }")
    print("Per docs: https://docs.abacatepay.com/pages/pix-qrcode/create")

if __name__ == '__main__':
    main()
