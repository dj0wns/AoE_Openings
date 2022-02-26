from django.core.management.base import BaseCommand
from opening_stats.utils import ProcessNextElementInAdvancedQueue
import time


class Command(BaseCommand):
  def handle(self, **options):
    while True:
      found = ProcessNextElementInAdvancedQueue();
      if not found:
        # If nothing in queue wait half a second before trying again to not bog down the system
        time.sleep(0.5)

