from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import re

app = FastAPI(title="TALI ML Service", version="1.0.0")

# Load trained model (will be None initially)
try:
    model = joblib.load('models/subscription_detector_v1.pkl')
except:
    model = None  # Will train on first use

# Known subscription merchants database (UAE/GCC specific)
KNOWN_MERCHANTS = {
    # Entertainment - Streaming
    'NETFLIX': {'category': 'entertainment', 'subcategory': 'video_streaming', 'frequency': 'monthly'},
    'SPOTIFY': {'category': 'entertainment', 'subcategory': 'music', 'frequency': 'monthly'},
    'AMAZON PRIME': {'category': 'shopping', 'subcategory': 'membership', 'frequency': 'monthly'},
    'OSN': {'category': 'entertainment', 'subcategory': 'tv', 'frequency': 'monthly'},
    'SHAHID': {'category': 'entertainment', 'subcategory': 'video_streaming', 'frequency': 'monthly'},
    'SHAHID VIP': {'category': 'entertainment', 'subcategory': 'video_streaming', 'frequency': 'monthly'},
    'ANGHAMI': {'category': 'entertainment', 'subcategory': 'music', 'frequency': 'monthly'},
    'ANGHAMI PLUS': {'category': 'entertainment', 'subcategory': 'music', 'frequency': 'monthly'},
    'DISNEY': {'category': 'entertainment', 'subcategory': 'video_streaming', 'frequency': 'monthly'},
    'DISNEY PLUS': {'category': 'entertainment', 'subcategory': 'video_streaming', 'frequency': 'monthly'},
    'HBO': {'category': 'entertainment', 'subcategory': 'video_streaming', 'frequency': 'monthly'},
    'HBO MAX': {'category': 'entertainment', 'subcategory': 'video_streaming', 'frequency': 'monthly'},
    'STARZPLAY': {'category': 'entertainment', 'subcategory': 'video_streaming', 'frequency': 'monthly'},
    'APPLE MUSIC': {'category': 'entertainment', 'subcategory': 'music', 'frequency': 'monthly'},
    'YOUTUBE PREMIUM': {'category': 'entertainment', 'subcategory': 'video_streaming', 'frequency': 'monthly'},
    'APPLE TV': {'category': 'entertainment', 'subcategory': 'video_streaming', 'frequency': 'monthly'},

    # Software & Productivity
    'ADOBE': {'category': 'software', 'subcategory': 'creative_tools', 'frequency': 'monthly'},
    'ADOBE CREATIVE CLOUD': {'category': 'software', 'subcategory': 'creative_tools', 'frequency': 'monthly'},
    'MICROSOFT 365': {'category': 'software', 'subcategory': 'productivity', 'frequency': 'monthly'},
    'OFFICE 365': {'category': 'software', 'subcategory': 'productivity', 'frequency': 'monthly'},
    'APPLE ICLOUD': {'category': 'software', 'subcategory': 'cloud_storage', 'frequency': 'monthly'},
    'GOOGLE ONE': {'category': 'software', 'subcategory': 'cloud_storage', 'frequency': 'monthly'},
    'DROPBOX': {'category': 'software', 'subcategory': 'cloud_storage', 'frequency': 'monthly'},
    'ZOOM': {'category': 'software', 'subcategory': 'communication', 'frequency': 'monthly'},
    'CANVA': {'category': 'software', 'subcategory': 'design', 'frequency': 'monthly'},
    'NOTION': {'category': 'software', 'subcategory': 'productivity', 'frequency': 'monthly'},
    'EVERNOTE': {'category': 'software', 'subcategory': 'productivity', 'frequency': 'monthly'},

    # UAE Utilities
    'DU': {'category': 'utilities', 'subcategory': 'telecom', 'frequency': 'monthly'},
    'ETISALAT': {'category': 'utilities', 'subcategory': 'telecom', 'frequency': 'monthly'},
    'VIRGIN MOBILE': {'category': 'utilities', 'subcategory': 'telecom', 'frequency': 'monthly'},
    'DEWA': {'category': 'utilities', 'subcategory': 'electricity', 'frequency': 'monthly'},
    'SEWA': {'category': 'utilities', 'subcategory': 'electricity', 'frequency': 'monthly'},
    'FEWA': {'category': 'utilities', 'subcategory': 'electricity', 'frequency': 'monthly'},
    'ADDC': {'category': 'utilities', 'subcategory': 'electricity', 'frequency': 'monthly'},
    'AADC': {'category': 'utilities', 'subcategory': 'electricity', 'frequency': 'monthly'},
    'EMPOWER': {'category': 'utilities', 'subcategory': 'cooling', 'frequency': 'monthly'},
    'TABREED': {'category': 'utilities', 'subcategory': 'cooling', 'frequency': 'monthly'},

    # Fitness & Gyms (UAE specific)
    'FITNESS FIRST': {'category': 'fitness', 'subcategory': 'gym', 'frequency': 'monthly'},
    'GOLD\'S GYM': {'category': 'fitness', 'subcategory': 'gym', 'frequency': 'monthly'},
    'GYM NATION': {'category': 'fitness', 'subcategory': 'gym', 'frequency': 'monthly'},
    'FITNESS 360': {'category': 'fitness', 'subcategory': 'gym', 'frequency': 'monthly'},
    'VOGUE FITNESS': {'category': 'fitness', 'subcategory': 'gym', 'frequency': 'monthly'},
    'CRANK FITNESS': {'category': 'fitness', 'subcategory': 'gym', 'frequency': 'monthly'},
    'WAREHOUSE GYM': {'category': 'fitness', 'subcategory': 'gym', 'frequency': 'monthly'},
    'SPARTAN': {'category': 'fitness', 'subcategory': 'gym', 'frequency': 'monthly'},
    'CROSSFIT': {'category': 'fitness', 'subcategory': 'gym', 'frequency': 'monthly'},
    'BARRY\'S': {'category': 'fitness', 'subcategory': 'boutique', 'frequency': 'monthly'},
    'F45': {'category': 'fitness', 'subcategory': 'boutique', 'frequency': 'monthly'},
    'ORANGETHEORY': {'category': 'fitness', 'subcategory': 'boutique', 'frequency': 'monthly'},
    'YOGA': {'category': 'fitness', 'subcategory': 'yoga', 'frequency': 'monthly'},
    'PILATES': {'category': 'fitness', 'subcategory': 'pilates', 'frequency': 'monthly'},

    # BNPL (Buy Now Pay Later) - UAE popular
    'TABBY': {'category': 'financial', 'subcategory': 'bnpl', 'frequency': 'monthly'},
    'POSTPAY': {'category': 'financial', 'subcategory': 'bnpl', 'frequency': 'monthly'},
    'SPOTII': {'category': 'financial', 'subcategory': 'bnpl', 'frequency': 'monthly'},
    'TAMARA': {'category': 'financial', 'subcategory': 'bnpl', 'frequency': 'monthly'},
    'CASHEW': {'category': 'financial', 'subcategory': 'bnpl', 'frequency': 'monthly'},

    # Meal Plans & Food Subscriptions (UAE)
    'EAT CLEAN ME': {'category': 'food', 'subcategory': 'meal_plan', 'frequency': 'weekly'},
    'KCAL': {'category': 'food', 'subcategory': 'meal_plan', 'frequency': 'weekly'},
    'RIGHT BITE': {'category': 'food', 'subcategory': 'meal_plan', 'frequency': 'weekly'},
    'FITNESS MEALS': {'category': 'food', 'subcategory': 'meal_plan', 'frequency': 'weekly'},
    'HEALTH FACTORY': {'category': 'food', 'subcategory': 'meal_plan', 'frequency': 'weekly'},
    'SOUL SANTE': {'category': 'food', 'subcategory': 'meal_plan', 'frequency': 'weekly'},
    'NUTRITION': {'category': 'food', 'subcategory': 'meal_plan', 'frequency': 'weekly'},
    'JUST MEAL': {'category': 'food', 'subcategory': 'meal_plan', 'frequency': 'weekly'},
    'FIT AND FRESH': {'category': 'food', 'subcategory': 'meal_plan', 'frequency': 'weekly'},
    'MACRO MEALS': {'category': 'food', 'subcategory': 'meal_plan', 'frequency': 'weekly'},

    # Delivery Subscriptions
    'CAREEM PLUS': {'category': 'shopping', 'subcategory': 'delivery_membership', 'frequency': 'monthly'},
    'TALABAT PRO': {'category': 'shopping', 'subcategory': 'delivery_membership', 'frequency': 'monthly'},
    'NOON ONE': {'category': 'shopping', 'subcategory': 'delivery_membership', 'frequency': 'monthly'},
    'DELIVEROO PLUS': {'category': 'shopping', 'subcategory': 'delivery_membership', 'frequency': 'monthly'},

    # Education & Learning
    'UDEMY': {'category': 'education', 'subcategory': 'online_courses', 'frequency': 'monthly'},
    'COURSERA': {'category': 'education', 'subcategory': 'online_courses', 'frequency': 'monthly'},
    'LINKEDIN LEARNING': {'category': 'education', 'subcategory': 'online_courses', 'frequency': 'monthly'},
    'SKILLSHARE': {'category': 'education', 'subcategory': 'online_courses', 'frequency': 'monthly'},
    'MASTERCLASS': {'category': 'education', 'subcategory': 'online_courses', 'frequency': 'monthly'},
    'DUOLINGO': {'category': 'education', 'subcategory': 'language', 'frequency': 'monthly'},

    # News & Magazines
    'NEW YORK TIMES': {'category': 'news', 'subcategory': 'newspaper', 'frequency': 'monthly'},
    'WASHINGTON POST': {'category': 'news', 'subcategory': 'newspaper', 'frequency': 'monthly'},
    'ECONOMIST': {'category': 'news', 'subcategory': 'magazine', 'frequency': 'monthly'},
    'BLOOMBERG': {'category': 'news', 'subcategory': 'financial_news', 'frequency': 'monthly'},
    'FINANCIAL TIMES': {'category': 'news', 'subcategory': 'financial_news', 'frequency': 'monthly'},

    # Gaming
    'PLAYSTATION': {'category': 'gaming', 'subcategory': 'console', 'frequency': 'monthly'},
    'XBOX': {'category': 'gaming', 'subcategory': 'console', 'frequency': 'monthly'},
    'NINTENDO': {'category': 'gaming', 'subcategory': 'console', 'frequency': 'monthly'},
    'STEAM': {'category': 'gaming', 'subcategory': 'pc_gaming', 'frequency': 'monthly'},
    'EPIC GAMES': {'category': 'gaming', 'subcategory': 'pc_gaming', 'frequency': 'monthly'},

    # UAE Specific Services
    'NOOR': {'category': 'finance', 'subcategory': 'investment', 'frequency': 'monthly'},
    'SARWA': {'category': 'finance', 'subcategory': 'investment', 'frequency': 'monthly'},
    'INSURANCE': {'category': 'insurance', 'subcategory': 'general', 'frequency': 'monthly'},
    'PARKING': {'category': 'transportation', 'subcategory': 'parking', 'frequency': 'monthly'},
    'SALIK': {'category': 'transportation', 'subcategory': 'toll', 'frequency': 'monthly'},

    # Other Popular Subscriptions
    'AUDIBLE': {'category': 'entertainment', 'subcategory': 'audiobooks', 'frequency': 'monthly'},
    'KINDLE UNLIMITED': {'category': 'entertainment', 'subcategory': 'ebooks', 'frequency': 'monthly'},
    'SCRIBD': {'category': 'entertainment', 'subcategory': 'reading', 'frequency': 'monthly'},
    'MEDIUM': {'category': 'entertainment', 'subcategory': 'reading', 'frequency': 'monthly'},
    'HEADSPACE': {'category': 'wellness', 'subcategory': 'meditation', 'frequency': 'monthly'},
    'CALM': {'category': 'wellness', 'subcategory': 'meditation', 'frequency': 'monthly'},
}


class Transaction(BaseModel):
    merchant_name: str
    amount: float
    date: str


class DetectionRequest(BaseModel):
    transaction: Transaction
    history: List[Transaction]


class DetectionResponse(BaseModel):
    is_subscription: bool
    confidence: float
    frequency: Optional[str]
    category: Optional[str]
    subcategory: Optional[str]
    next_charge_date: Optional[str]


def normalize_merchant_name(name: str) -> str:
    """Normalize merchant name for matching"""
    if not name:
        return ''

    # Remove common prefixes/suffixes
    name = re.sub(r'(^|\s)(INC|LLC|LTD|CORP|CO|WWW|HTTP|HTTPS)(\s|$)', ' ', name.upper())
    # Remove special characters
    name = re.sub(r'[^A-Z0-9\s]', '', name)
    # Remove extra spaces
    name = ' '.join(name.split())
    return name


def check_known_merchant(merchant: str) -> Optional[dict]:
    """Check if merchant is in known subscription database"""
    normalized = normalize_merchant_name(merchant)

    for known_merchant, info in KNOWN_MERCHANTS.items():
        if known_merchant in normalized:
            return {
                'is_subscription': True,
                'confidence': 0.98,
                'frequency': info['frequency'],
                'category': info['category'],
                'subcategory': info['subcategory']
            }
    return None


def detect_recurring_pattern(history: List[Transaction], current: Transaction) -> dict:
    """Detect recurring payment patterns"""
    if len(history) < 1:
        return {'is_subscription': False, 'confidence': 0.0}

    # Group by merchant and amount
    matching_transactions = []
    for txn in history:
        if (normalize_merchant_name(txn.merchant_name) == normalize_merchant_name(current.merchant_name) and
                abs(txn.amount - current.amount) < 0.01):
            matching_transactions.append(txn)

    if len(matching_transactions) < 1:
        return {'is_subscription': False, 'confidence': 0.0}

    # Calculate intervals between transactions
    dates = [datetime.fromisoformat(t.date.replace('Z', '+00:00')) for t in matching_transactions]
    dates.append(datetime.fromisoformat(current.date.replace('Z', '+00:00')))
    dates.sort()

    intervals = [(dates[i + 1] - dates[i]).days for i in range(len(dates) - 1)]

    if not intervals:
        return {'is_subscription': False, 'confidence': 0.0}

    avg_interval = np.mean(intervals)
    std_interval = np.std(intervals) if len(intervals) > 1 else 0

    # Determine frequency
    frequency = None
    confidence = 0.0

    if 27 <= avg_interval <= 33:  # Monthly (allow some variance)
        frequency = 'monthly'
        confidence = 0.95 if std_interval < 3 else 0.80
    elif 360 <= avg_interval <= 370:  # Yearly
        frequency = 'yearly'
        confidence = 0.90
    elif 6 <= avg_interval <= 8:  # Weekly
        frequency = 'weekly'
        confidence = 0.85
    elif 88 <= avg_interval <= 95:  # Quarterly
        frequency = 'quarterly'
        confidence = 0.85

    if frequency:
        return {
            'is_subscription': True,
            'confidence': confidence,
            'frequency': frequency
        }

    return {'is_subscription': False, 'confidence': 0.0}


def calculate_next_charge_date(current_date: str, frequency: str) -> str:
    """Predict next charge date"""
    current = datetime.fromisoformat(current_date.replace('Z', '+00:00'))

    if frequency == 'monthly':
        next_date = current + timedelta(days=30)
    elif frequency == 'yearly':
        next_date = current + timedelta(days=365)
    elif frequency == 'weekly':
        next_date = current + timedelta(days=7)
    elif frequency == 'quarterly':
        next_date = current + timedelta(days=90)
    else:
        next_date = current + timedelta(days=30)

    return next_date.isoformat()


@app.post('/detect', response_model=DetectionResponse)
async def detect_subscription(request: DetectionRequest):
    """Main detection endpoint"""
    try:
        # First check known merchants
        known_result = check_known_merchant(request.transaction.merchant_name)
        if known_result:
            next_charge = calculate_next_charge_date(
                request.transaction.date,
                known_result['frequency']
            )
            return DetectionResponse(
                is_subscription=True,
                confidence=known_result['confidence'],
                frequency=known_result['frequency'],
                category=known_result['category'],
                subcategory=known_result['subcategory'],
                next_charge_date=next_charge
            )

        # Check for recurring patterns
        pattern_result = detect_recurring_pattern(request.history, request.transaction)

        if pattern_result['is_subscription']:
            next_charge = calculate_next_charge_date(
                request.transaction.date,
                pattern_result['frequency']
            )
            return DetectionResponse(
                is_subscription=True,
                confidence=pattern_result['confidence'],
                frequency=pattern_result['frequency'],
                category=None,
                subcategory=None,
                next_charge_date=next_charge
            )

        # Not detected as subscription
        return DetectionResponse(
            is_subscription=False,
            confidence=0.0,
            frequency=None,
            category=None,
            subcategory=None,
            next_charge_date=None
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/health')
async def health_check():
    return {
        'status': 'healthy',
        'model_loaded': model is not None,
        'known_merchants': len(KNOWN_MERCHANTS)
    }


@app.get('/')
async def root():
    return {
        'service': 'TALI ML Service',
        'version': '1.0.0',
        'endpoints': {
            'detect': '/detect',
            'health': '/health'
        }
    }


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
