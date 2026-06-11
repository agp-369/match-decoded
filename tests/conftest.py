"""Test configuration — ensures backend modules are importable before tests"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend'))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__))))
